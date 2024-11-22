/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "t4qlfu26",
    "name": "lesson_title",
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
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "t4qlfu26",
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
