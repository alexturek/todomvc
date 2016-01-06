/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
var app = app || {};

(function () {
	'use strict';

	var Utils = app.Utils;
	// Generic "model" object. You can use whatever
	// framework you want. For this application it
	// may not even be worth separating this logic
	// out, but we do this to demonstrate one way to
	// separate out parts of your application.
	app.TaskModel = function (key) {
		this.key = key;
		this.tasks = Utils.store(key);
		this.onChanges = [];
	};

	app.TaskModel.prototype.subscribe = function (onChange) {
		this.onChanges.push(onChange);
	};

	app.TaskModel.prototype.inform = function () {
		Utils.store(this.key, this.tasks);
		this.onChanges.forEach(function (cb) { cb(); });
	};

	app.TaskModel.prototype.addTask = function (title) {
		this.tasks = this.tasks.concat({
			id: Utils.uuid(),
			title: title,
			completed: false
		});

		this.inform();
	};

	app.TaskModel.prototype.toggleAll = function (checked) {
		// Note: it's usually better to use immutable data structures since they're
		// easier to reason about and React works very well with them. That's why
		// we use map() and filter() everywhere instead of mutating the array or
		// task items themselves.
		this.tasks = this.tasks.map(function (task) {
			return Utils.extend({}, task, {completed: checked});
		});

		this.inform();
	};

	app.TaskModel.prototype.toggle = function (taskToToggle) {
		this.tasks = this.tasks.map(function (task) {
			return task !== taskToToggle ?
				task :
				Utils.extend({}, task, {completed: !task.completed});
		});

		this.inform();
	};

	app.TaskModel.prototype.destroy = function (task) {
		this.tasks = this.tasks.filter(function (candidate) {
			return candidate !== task;
		});

		this.inform();
	};

	app.TaskModel.prototype.save = function (taskToSave, text) {
		this.tasks = this.tasks.map(function (task) {
			return task !== taskToSave ? task : Utils.extend({}, task, {title: text});
		});

		this.inform();
	};

	app.TaskModel.prototype.clearCompleted = function () {
		this.tasks = this.tasks.filter(function (task) {
			return !task.completed;
		});

		this.inform();
	};

})();
