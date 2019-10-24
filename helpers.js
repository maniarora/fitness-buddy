
//helpers property contains all the helper functions so we know where a function comes from when we see it in codebase

module.exports.helpers = {
        
 /**
 * parameter :(handlerInput)  the handlerInput object passed into each handler function in alexa
 * parameter: (updateObject) the object of K:V pairs that need to be added to the existing session or persistent object, as needed.
 *              NOTE:  each key in this object MUST have data that follows the same 'shape'/type as in the database 
 * returns the updated data object
 */ 

 updateSessionAttributes (handlerInput, updateObject) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        const updatedObject = { ...sessionAttributes, ...updateObject }
        attributesManager.setSessionAttributes(updatedObject);
        //returns
        return updatedObject
},

async updatePersistentAttributes (handlerInput, updateObject)  {
        const attributesManager = handlerInput.attributesManager;
        const persistedAttributes = await attributesManager.getPersistentAttributes()
        const updatedObject = {...persistedAttributes, ...updateObject}
        attributesManager.setPersistentAttributes(updatedObject);
        await attributesManager.savePersistentAttributes();
        //returns
        return updatedObject
}
        
}

