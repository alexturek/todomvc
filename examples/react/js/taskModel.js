/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global _ */
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

	app.TaskModel.prototype.complete = function(id) {
		var found = this.find(id);
		if (!found || !found.subtask) {
			return;
		}
		this.tasks = _.map(this.tasks, function(task) {
			if (task != found.parent) return task;
			return _.extend({}, task, {
				subtasks: task.subtasks.map(function(subtask) {
					if (subtask.id != id) return subtask;
					return _.extend({}, subtask, { completed: !subtask.completed });
				}),
			});
		});
		this.inform();
	};

	app.TaskModel.prototype.isCompleted = function(id) {
		var found = this.find(id);
		if (!found) return false;
		if (found.task) {
			var task = found.task;
			return task.subtasks.length &&
						 task.subtasks.length == Utils.completedSubtasks(task).length;
		}
		if (found.subtask) {
			return found.subtask.completed;
		}
	};

	app.TaskModel.prototype.addSubtask = function (id, title) {
		var found = this.find(id);
		if (!found || !found.task) return;
		this.tasks = _.map(this.tasks, function(task) {
			if (task != found.task) return task;
			return _.extend({}, task, {
				subtasks: task.subtasks.concat([{
					id: Utils.uuid(),
					title: title,
					completed: false,
				}])
			});
		});
		this.inform();
	};

	app.TaskModel.prototype.subscribe = function (onChange) {
		this.onChanges.push(onChange);
	};

	app.TaskModel.prototype.inform = function () {
		Utils.store(this.key, this.tasks);
		this.onChanges.forEach(function (cb) { cb(); });
	};

	app.TaskModel.prototype.find = function(id) {
		var matcher = { id: id };
		return _.compact(_.map(this.tasks, function(task) {
			if (task.id == id) {
				return { task: task };
			}
			var subtask = _.find(task.subtasks, matcher);
			if (subtask) {
				return {
					parent: task,
					subtask: subtask,
				};
			}
		}))[0];
	};

	app.TaskModel.prototype.addTask = function (title) {
		this.tasks = this.tasks.concat({
			id: Utils.uuid(),
			title: title,
			subtasks: [],
		});

		this.inform();
	};

})();
