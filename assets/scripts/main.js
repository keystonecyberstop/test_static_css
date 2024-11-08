function sortBy( key, cb ) {
  if ( !cb ) cb = () => 0;
  return ( a, b ) => ( a[key] > b[key] ) ? 1 :
      ( ( b[key] > a[key] ) ? -1 : cb( a, b ) );
}

function sortByDesc( key, cb ) {
  if ( !cb ) cb = () => 0;
  return ( b, a ) => ( a[key] > b[key] ) ? 1 :
      ( ( b[key] > a[key] ) ? -1 : cb( b, a ) );
}

function orderBy( keys, orders ) {
  let cb = () => 0;
  keys.reverse();
  orders.reverse();
  for ( const [i, key] of keys.entries() ) {
      const order = orders[i];
      if ( order == 'asc' )
          cb = sortBy( key, cb );
      else if ( order == 'desc' )
          cb = sortByDesc( key, cb );
      else
          throw new Error( `Unsupported order "${order}"` );
  }
  return cb;
}

function transformTitle(item) {
  const {match_score, First_Name, Last_Name, Full_Name, Other_Names, ...rest} = item
  return {match_score, First_Name, Last_Name, Full_Name, Other_Names, ...rest}
}

const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;


const app = Vue.createApp({
  
  compilerOptions: {
    delimiters: ["${", "}$"]
  },
  data() {
    return {
      riskLevels: [1, 2, 3, 4, 5],
      riskNames: ['Low', 'Medium', 'High'],
      data_info: data_info,
      potential_match: potential_match,
      potentialMatch: {
        Customer_Potential_Match: null
      }
    }
  },
  created() {
    console.log('app is created')
  },
  mounted() {
    this.potentialMatch = this.mapPotentialMatch(this.potential_match)
    console.log('this.potentialMatch ', this.potentialMatch);
  },
  methods: {
     /**
       * It receives a Potionial Match list, which is flattened and later
       * filteres the null values from array
       * @param array Two Dimensional array
       * @returns Single dimention array
       */
      flattenPotentialList(array) {
        const result = array.flat().filter(Boolean)
        return result
      },

    /**
     * It filters the flattened list to remove duplicaiton
     * @param array Flatted array of Potential List
     * @param potentialItemID Id of Potential Item
     * @returns Filtered Array
     */
    deleteDuplication(array, potentialItemID) {
      return array.filter(item => item.ID !== potentialItemID)
    },
    mapPotentialMatch(data) {
      const records = ['Customer_Potential_Match', 'UBO_Potential_Match', 'Legal_Representative_Potential_Match']
      let potentialMatches = {};
      records.forEach(element => {
        let record = data[element].potential_match;
        let details;
        let sorted;
        let name;
        let matchlistArray;
        let userDetails = data[element].user_details;
        let userListArray;
        if (record) {
          const flattenedList = this.flattenPotentialList(data[element].potential_match_list)
          const finalList = this.deleteDuplication(flattenedList, record.ID);
          // sorted = orderBy(finalList, ['match_score'], ['desc'])
          sorted = finalList.concat().sort(orderBy(['match_score'],['desc']))


          
          details = transformTitle(record)
          matchlistArray = sorted.map((item) => {
            const {match_score, First_Name, Last_Name, Full_Name, Other_Names, ...rest} = item
            return {match_score, First_Name, Last_Name, Full_Name, Other_Names, ...rest}
          })
          name = !isEmpty(record['First_Name']) || !isEmpty(record['Last_Name']) ? record['First_Name'] + ' ' + record['Last_Name'] : record['Full_Name']
        }
        potentialMatches[element] = {
          Name: name,
          title: element.split('_').join(' '),
          details: details,
          userDetails: data[element].user_details,
          bestMatchScore: data[element].best_match_score,
          matchedRecords: data[element].matched_records,
          list: matchlistArray
        }
      });
      
      return {
        ...potentialMatches
      };
    }
  }
})


app.mount('#app')