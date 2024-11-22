/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4xpz4yqdw66z1c4")

  // remove
  collection.schema.removeField("i84vbiag")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rg9idkbr",
    "name": "site_logo",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4xpz4yqdw66z1c4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "i84vbiag",
    "name": "site_logo",
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

  // remove
  collection.schema.removeField("rg9idkbr")

  return dao.saveCollection(collection)
})
