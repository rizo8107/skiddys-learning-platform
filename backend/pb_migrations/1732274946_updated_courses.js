/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "u8yv8ibk",
    "name": "level",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Beginner",
        "Intermediate",
        "Advanced"
      ]
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cdtyzbyt",
    "name": "instructor",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "dljz6s33uy7bln6",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // remove
  collection.schema.removeField("u8yv8ibk")

  // remove
  collection.schema.removeField("cdtyzbyt")

  return dao.saveCollection(collection)
})
