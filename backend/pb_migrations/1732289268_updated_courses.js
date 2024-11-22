/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f3gegdk3",
    "name": "enabled",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("y96e0qgwfuzmre3")

  // remove
  collection.schema.removeField("f3gegdk3")

  return dao.saveCollection(collection)
})
