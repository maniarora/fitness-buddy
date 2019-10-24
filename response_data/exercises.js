module.exports = {
    responses: {
        // NOTE: the body part names MUST be the same as the various values registered under the SLOT type BODYPART
        abs: {
            exercises: ['planks', 'sit ups', 'and leg ups'] // primary responses
        },
        chest: {
            exercises: ['push ups','chest flys', 'barbell dips', 'incline presses',  'and bench presses']
        },
        biceps: {
            exercises: ['barbell curls', 'pushups', 'preacher curls',  'and pull ups']
        },
        thighs: {
            exercises : ['squats', 'leg press', 'dumbell lunge', 'and deadlifts']
        },
        triceps: {
            exercises : ['rope pushdowns', 'dips', 'and skullcrushers']
        },
        back: {
            exercises : ['deadlifts', 'lat pulldowns', 'and seated rows']
        },
        hamstrings: {
            exercises : ['machine leg curl', 'reverse sled pulls', 'and deadlifts']
        },
        glutes: {
            exercises : ['glute bridge', 'barbell hip trusts', 'and dumbell sumo squats']
        }
    },
    
    /**
     *  method that extracts a flattened list of ALL exercises in exercises.js.
     *  needed for when user says i've completed X and we need to check that X is in the list of exercises
     */
    generateFlatExerciseList(){
       console.log("...generating full list of exercises...")
       
       let result =[ ] //list of all exercises in exercises.js
       
       for(let bodypart in this.responses) {
           let list = this.responses[bodypart].exercises
           
           list.forEach(item=>result.push(item))
       }
       
      return result;
    }
}
