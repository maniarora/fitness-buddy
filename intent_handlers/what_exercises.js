// INTENT HANDLER ONLY

const exercisesDB = require('../response_data/exercises.js')
const {helpers} = require('../helpers.js')

const WhatExerciseHandler = {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;
            
            return request.type === 'IntentRequest' &&
                request.intent.name === 'WHAT_EXERCISES';
        },

        async handle(handlerInput) {
            
            // fetch the spoken slot( maybe synonym) and resolve slot values 
            let uttered_bodypart = handlerInput.requestEnvelope.request.intent.slots.bodypart.value
            
            // handle synonym entity resolution
            let resolved_bodypart;
            if (handlerInput.requestEnvelope.request.intent.slots.bodypart.resolutions.resolutionsPerAuthority[0].values) {
                 resolved_bodypart = handlerInput.requestEnvelope.request.intent.slots.bodypart.resolutions.resolutionsPerAuthority[0].values[0].value.name 
            }
            
            console.log("UTTERED/SPOKEN BODY PART ", uttered_bodypart)
            console.log("RESOLVED BODY PART ", resolved_bodypart)

            //handle if bodypart not in exercises.js
            if (!resolved_bodypart || !exercisesDB.responses[resolved_bodypart]) {
                let resp = `cannot find exercises for ${uttered_bodypart}.`
                await helpers.updatePersistentAttributes(handlerInput,  {lastAlexaResponse: resp})
                return handlerInput.responseBuilder
                    .speak(resp)
                    .getResponse();
            }

            // ELSE:  extract the response array matched to the bodypart from exercises.js
            let { exercises } = exercisesDB.responses[resolved_bodypart]
            
            // construst response
            let resp = `For your ${uttered_bodypart}, you should do ${exercises.join(',')}`
            
            // update data in dynamoDB
            let updatedData ={
                lastAlexaResponse: resp,
                currentExerciseSet: {
                    bodypart: resolved_bodypart,
                    exercises:  exercises,
                    currentExerciseCount: 0
                }
            }
            await helpers.updatePersistentAttributes(handlerInput,  updatedData)
            //update session
            helpers.updateSessionAttributes(handlerInput, updatedData)

            // respond
            return handlerInput.responseBuilder
            .speak(resp)
            .reprompt(`In case you didn't hear me, I recommend the following exercises. ${exercises.join(',')}.`)
            .getResponse();
    },
};


module.exports = WhatExerciseHandler;
