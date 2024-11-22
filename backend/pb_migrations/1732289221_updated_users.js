/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dljz6s33uy7bln6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lz373wuj",
    "name": "course_access",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "y96e0qgwfuzmre3",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dljz6s33uy7bln6")

  // remove
  collection.schema.removeField("lz373wuj")

  return dao.saveCollection(collection)
})
