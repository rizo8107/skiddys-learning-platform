/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pov1oz14w7blftq",
    "created": "2024-11-22 11:33:18.447Z",
    "updated": "2024-11-22 11:33:18.447Z",
    "name": "enrollments",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "2ld80w2h",
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
        "id": "ccohj5aa",
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
        "id": "p7btxqr4",
        "name": "progress",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 100,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "8osar7wn",
        "name": "completedLessons",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
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
  const collection = dao.findCollectionByNameOrId("pov1oz14w7blftq");

  return dao.deleteCollection(collection);
})
