/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "xjsrcjoqam26s0o",
    "created": "2024-11-22 12:40:45.993Z",
    "updated": "2024-11-22 12:40:45.993Z",
    "name": "reviews",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "5r7tdaxt",
        "name": "course",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "y96e0qgwfuzmre3",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "see5qmev",
        "name": "user",
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
      },
      {
        "system": false,
        "id": "z2jk2whp",
        "name": "rating",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 5,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "1z62clns",
        "name": "comment",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 1000,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("xjsrcjoqam26s0o");

  return dao.deleteCollection(collection);
})
