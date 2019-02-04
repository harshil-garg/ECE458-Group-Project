const elastic = require('elasticsearch');
const Ingredient = require('../model/ingredient_model');

const esClient = new elastic.Client({
    host: '127.0.0.1:9200',
    log: 'error'
});

module.exports.bulkIndex = async function(){
    bulkIndex('hypomeals', 'ingredient', await Ingredient.find({}, '-_id').lean().exec((err, results) => {
        return results;
    }));
}

function bulkIndex(index, type, data) {
    let bulkBody = [];
  
    data.forEach(item => {
      bulkBody.push({
        index: {
          _index: index,
          _type: type,
          _id: item.id
        }
      });
  
      bulkBody.push(item);
    });
  
    esClient.bulk({body: bulkBody})
    .then(response => {
      let errorCount = 0;
      response.items.forEach(item => {
        if (item.index && item.index.error) {
          console.log(++errorCount, item.index.error);
        }
      });
      console.log(
        `Successfully indexed ${data.length - errorCount}
         out of ${data.length} items`
      );
    })
    .catch(console.err);
  };
  