const exercisesDB = require('../response_data/exercises.js')
const {helpers} = require('../helpers.js')

const NextExerciseHandler = {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;
            
            return request.type === 'IntentRequest' &&
                request.intent.name === 'WHAT_IS_NEXT_EXERCISE';
        },

        async handle(handlerInput) {
            
            // fetch the spoken slot( maybe synonym) and resolve slot values 
            let uttered_exercise = handlerInput.requestEnvelope.request.intent.slots.exercise.value
            
            
            // retrieve session attributes that were saved in session in the canHandle() method...
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes()
            
            // handle if no currentExerciseSet is stored on the session attributes...
            if(!sessionAttributes.currentExerciseSet) { 
                // respond
                let resp = `you have not chosen a body part to focus on.  Ask me for exercises for a body part to get started`
                // update database and session
            let updatedData ={
                lastAlexaResponse: resp,
                // update only the exercise count using the spread operator
                currentExerciseSet: { ...sessionAttributes.currentExerciseSet}
            }
            
            helpers.updatePersistentAttributes(handlerInput, updatedData)
            helpers.updateSessionAttributes(handlerInput, updatedData)
                return handlerInput.responseBuilder
                .speak(resp)
                .reprompt(`In case you didn't hear me, i said ${resp}.`)
                .getResponse();
            }
            
            // build response
            let resp;
            let max = sessionAttributes.currentExerciseSet.exercises.length 
            
            let exerciseIndex = sessionAttributes.currentExerciseSet.currentExerciseCount
            if (exerciseIndex=== max ) {
                let resp = `You've finished all exercises for ${sessionAttributes.currentExerciseSet.bodypart}`
                 return handlerInput.responseBuilder
                .speak(resp)
                .reprompt(`In case you didn't hear me, i said ${resp}.`)
                .getResponse();
            }
            
            let next = sessionAttributes.currentExerciseSet.exercises[exerciseIndex]
            
            //remove the 'and' from the last exercise....
            if(next.includes('and')) {
                next = next.replace('and', '')
            }
            
            // customise response to include utterance if there is one
            if (!uttered_exercise) {
                resp = `the next exercise for you is ${next}`
            } else {
                resp = `After ${uttered_exercise}, the next exercise for you is ${next} `
            }
    
            // update database and session
            let updatedData ={
                lastAlexaResponse: resp,
                // update only the exercise count using the spread operator
                currentExerciseSet: { ...sessionAttributes.currentExerciseSet, currentExerciseCount: ++exerciseIndex}
            }
            
            helpers.updatePersistentAttributes(handlerInput, updatedData)
            helpers.updateSessionAttributes(handlerInput, updatedData)

            // respond
            return handlerInput.responseBuilder
            .speak(resp)
            .reprompt(`In case you didn't hear me, i said ${resp}.`)
            .getResponse();
    },
};


module.exports = NextExerciseHandler;
