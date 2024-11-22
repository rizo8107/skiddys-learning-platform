/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("1wiex0gk19wgqpz");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "1wiex0gk19wgqpz",
    "created": "2024-11-22 15:20:11.108Z",
    "updated": "2024-11-22 15:20:11.108Z",
    "name": "course_access",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fbb02ela",
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
        "id": "3dotexlh",
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
        "id": "m4nee1lm",
        "name": "granted_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
})
