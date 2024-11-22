/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wvnazgyryxlwmr2")

  // remove
  collection.schema.removeField("kfkw6lzl")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wvnazgyryxlwmr2")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kfkw6lzl",
    "name": "resource_description",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
