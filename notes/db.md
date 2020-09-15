# Database

As of v0.1.0 the DocNow application sits on top of a PostgreSQL database. We use
[Knex] to talk to the database from Node, and [Objection] as a simple layer
above Knex for turning database results into JavaScript objects. Most of the
work of looking up things in the database is done in DocNow's [Database class]
which contains application logic (looking up users and their collections, etc).

## Modifying the Database

In order to modify or use the database you will need to do the following. 

1. Create a database migration
2. Create a model
3. Use the model

### 1. Create Migration

Database migrations are stored in `src/server/migrations`. You can create a new
one by running this command where migration_name is replaced with a title for
your migration:

    npx knex migrate:make migration_name

So lets say I was adding a new "widget" table to the database I would:

    npx knex migrate:make widget

This would create a time stamped file like:

    ./src/server/migrations/20200915094827_add_widget.js

Then you populate the file with your schema changes. See the [Knex Schema]
documentation to see all the options for how to create tables and relate them
together. Make sure to fill out both the `up` and `down` functions which will
allow the migration to be applied and then torn down if a rollback is needed.

So for example, if we want to create a `widget` table that just stores the name of the 
widget we would have a migration that looks like:

```javascript
exports.up = async (knex) => {
	.createTable('widget', table => {
		table.increments('id').primary()
		table.text('name').notNullable()
	})  
}

exports.down = async (knex) => {
  return knex.schema
		.dropTable('widget')
}
```

When you are happy with the migration you can apply it to your database:

		npx knex migrate:up --node_env development

## 2. Create Model

It is often easier to use the database via an Objection model, which gives you a
handy way of querying the database and getting back JavaScript objects for use
elsewhere in the application. To do this you just need to create a file in
`src/server/models`.

So for our `widget` example above we would create a file `src/server/models/Widget.js`

```javascript
const { Model } = require('objection')

class User extends Model {
  static get tableName() {
    return 'widget'
  }
}
```

Things can get more fancy if you want to provide mappings to other models for
one-to-many relationships and things like that, but that is the basic idea. See
the [Objection Model] documentation for the details.

## 3. Use the Model

Now you can use the model by importing it and querying for data. You will most
likely want to add this as a method to the Database class in `src/server/db.js`
since it does the work of creating the appropriate database connection.

```javascript

import Widget from './models/Widget'

const w = Widget.insertAndFetch({name: 'Test Widget'})
console.log(`Created ${w.name} widget with id ${w.id}`)
```

Objection provides full access to Knex which gives you the full power of SQL
using a JavaScript API. Here's a simple example of getting all the widgets in
the database:

```
const widgets = Widget.query().select()
```

[Knex]: https://knexjs.org/
[Objection]: http://vincit.github.io/objection.js/
[Database]: https://github.com/DocNow/docnow/blob/master/src/server/db.js
[Knex Schema]: http://knexjs.org/#Schema
[Objection Model]: http://vincit.github.io/objection.js/api/model/
