/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x9accbwxpq2chr1")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9yx7dkgp",
    "name": "lessons_tittle",
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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x9accbwxpq2chr1")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9yx7dkgp",
    "name": "tittle",
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
