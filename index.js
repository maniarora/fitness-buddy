/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk');
const DynamoDbPersistenceAdapter = require('ask-sdk-dynamodb-persistence-adapter')
const { helpers } = require('./helpers.js')

/* CONSTANTS */
const SKILL_NAME = 'Fitness Buddy';
const NEXT_EXCERCISE_MESSAGE = 'Here\'s your next exercise: ';
const HELP_MESSAGE = 'Fitness Buddy helps you with exercise recommendations and keeping track of your workout. For example, you can say its chest day, or new record for bench press at 50 kilograms';
const HELP_REPROMPT = HELP_MESSAGE + 'So, What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

/* WELCOME  */
const WelcomeIntentHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // this triggers EACH time ANY utterance is made, 
    // so update any existing session attribubtes with new data from db
    const attributesManager = handlerInput.attributesManager;
    const persistentAttributes = await attributesManager.getPersistentAttributes();
    helpers.updateSessionAttributes(handlerInput, persistentAttributes)
    // update persistent storage to record this session's timestamp
    attributesManager.setPersistentAttributes({ lastSessionDate: Date.now() });
    await attributesManager.savePersistentAttributes();
    return request.type === 'LaunchRequest' || (request.type === 'IntentRequest' && request.intent.name === 'WELCOME_INTENT');
  },
  
  async handle(handlerInput) {
    // check dynamoDB for previous session data
    const userID = handlerInput.requestEnvelope.session.user.userId
    // retrieve session attributes that were saved in session in the canHandle() method...
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes()
    // build response
    let response;
    if (sessionAttributes.lastSessionDate) {
      let lastSessionInDays = (Date.now() - sessionAttributes.lastSessionDate) / (24 * 60 * 60 * 1000) // today minus last session (both in millis) divided by no. of millis in a day, to yield # of days
      lastSessionInDays = Math.floor(lastSessionInDays)
      const lastSessionString = (lastSessionInDays > 0) ? `${lastSessionInDays} days ago` : `less than a day ago`
      response = `Welcome back! You last exercised with this skill ${lastSessionString}. How can I help you today?`
    }
    else {
      response = `Hi There. Looks like this is your first time here.  You can interact with the skill by requesting exercises for body parts, or updating your personal best for exercises. For more information, just say help!`
    }
    //update last alexa response in dynamodb
    await helpers.updatePersistentAttributes(handlerInput, { lastAlexaResponse: response })
    return handlerInput.responseBuilder.speak(response).reprompt(response).getResponse();
  },
};
/* HELP */
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(HELP_MESSAGE).reprompt(HELP_REPROMPT).getResponse();
  },
};
const useSkillHelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'SKILL_HELP';
  },
  handle(handlerInput) {
    let resp;
    // fetch the spoken slot( maybe synonym) and resolve slot values 
    let uttered_function = handlerInput.requestEnvelope.request.intent.slots.SKILL_FUNCTION.value
    // handle synonym entity resolution
    let resolved_function;
    if (handlerInput.requestEnvelope.request.intent.slots.SKILL_FUNCTION.resolutions.resolutionsPerAuthority[0].values) {
      resolved_function = handlerInput.requestEnvelope.request.intent.slots.SKILL_FUNCTION.resolutions.resolutionsPerAuthority[0].values[0].value.name
    }
    if (resolved_function.includes('recommend')) {
      resp = `Simply ask me what exercises should you do for a body part. For example you could ask for chest, arms, legs, or biceps.`
    }
    else if (resolved_function.includes('track')) {
      resp = `Simply ask me to track your last work out and I will.`
    }
    // retrieve session attributes that were saved in session in the canHandle() method...
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes()
    // update database and session
    let updatedData = {
      lastAlexaResponse: resp,
      // update only the exercise count using the spread operator
      currentExerciseSet: { ...sessionAttributes.currentExerciseSet }
    }
    helpers.updatePersistentAttributes(handlerInput, updatedData)
    helpers.updateSessionAttributes(handlerInput, updatedData)
    
    // respond
    return handlerInput.responseBuilder.speak(resp).reprompt(`In case you didn't hear me I said, ${resp}`).getResponse();
  }
};


/* EXIT */
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(STOP_MESSAGE).getResponse();
  },
};

/* END SESSION */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`
          Session ended with reason: $ { handlerInput.requestEnvelope.request.reason }
          `);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`
          Error handled: $ { error.message }
          `);
    return handlerInput.responseBuilder.speak('Sorry, an error occurred.').reprompt('Sorry, an error occurred.').getResponse();
  },
};
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder.addRequestHandlers(WelcomeIntentHandler, require('./intent_handlers/record_best.js'), HelpHandler, useSkillHelpHandler, ExitHandler, SessionEndedRequestHandler, require('./intent_handlers/what_exercises.js'), require('./intent_handlers/what_next_exercise.js')).addErrorHandlers(ErrorHandler).withTableName('FitnessBuddySessions').lambda();
