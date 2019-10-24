const {helpers} = require('../helpers.js')


// triggered on phrases such as
// 'Alexa, tell fitness buddy new record for bench press at fifty'
// Saves this information into DynamoDb
const RecordIntentHandler = {
  canHandle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    
    return request.intent.name === "RECORD_BEST_INTENT";
  },
  async handle(handlerInput) {
    
    const exercise = handlerInput.requestEnvelope.request.intent.slots.exercise.value;
    const weight = handlerInput.requestEnvelope.request.intent.slots.weight.value || 0;
    
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    let records = sessionAttributes.records;
    
    // oldweight to store previous record.
    let oldweight; 
    
    let speechText;
    for(var i =0;i<records.length;i++){
      // if uttered exercise has been recorded before, update weight count for the same.
      if(exercise===records[i].exercise){
        oldweight = records[i].weight;
        records[i].weight=weight;
        speechText = `Good work! Your new record for ${exercise} is ${weight} kilograms, from ${oldweight} kilograms.`;
        break;
      }
      else{
        // create new entry in db if uttered exercise has not been recorded before.
        if(i==records.length-1){
          const newrecord = {
            exercise: exercise,
            weight: weight
          };
        speechText = `Your new record for ${exercise} is ${weight} kilograms.`;
        records.push(newrecord);
        break;
        }
      }
    }
    
    let updatedData = {
      records: records
    };
    
    await helpers.updatePersistentAttributes(handlerInput,  updatedData);
    //update session
    helpers.updateSessionAttributes(handlerInput, updatedData);
    return handlerInput.responseBuilder.speak(speechText).withShouldEndSession(true).getResponse();
  }
};


module.exports = RecordIntentHandler;