/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global _, React, Router */
var app = app || {};

(function () {
	'use strict';

	app.ALL_TASKS = 'all';
	app.ACTIVE_TASKS = 'active';
	app.COMPLETED_TASKS = 'completed';
	var TaskFooter = app.TaskFooter;
	var TaskItem = app.TaskItem;

	var ENTER_KEY = 13;

	var TaskApp = React.createClass({
		getInitialState: function () {
			return {
				nowShowing: app.ALL_TASKS,
				editing: null,
				newTask: ''
			};
		},

		componentDidMount: function () {
			var setState = this.setState;
			var router = Router({
				'/': setState.bind(this, {nowShowing: app.ALL_TASKS}),
				'/unstarted': setState.bind(this, {nowShowing: app.ACTIVE_TASKS}),
				'/active': setState.bind(this, {nowShowing: app.ACTIVE_TASKS}),
				'/completed': setState.bind(this, {nowShowing: app.COMPLETED_TASKS})
			});
			router.init('/');
		},

		handleChange: function (event) {
			this.setState({newTask: event.target.value});
		},

		handleNewTaskKeyDown: function (event) {
			if (event.keyCode !== ENTER_KEY) {
				return;
			}

			event.preventDefault();

			var val = this.state.newTask.trim();

			if (val) {
				this.props.model.addTask(val);
				this.setState({newTask: ''});
			}
		},

		toggle: function (taskToToggle) {
			this.props.model.toggle(taskToToggle);
		},

		destroy: function (task) {
			this.props.model.destroy(task);
		},

		edit: function (task) {
			this.setState({editing: task.id});
		},

		save: function (taskToSave, text) {
			this.props.model.save(taskToSave, text);
			this.setState({editing: null});
		},

		cancel: function () {
			this.setState({editing: null});
		},

		clearCompleted: function () {
			this.props.model.clearCompleted();
		},

		toggleSubtask: function(id) {
			console.log('toggled', id);
			this.props.model.complete(id);
		},

		render: function () {
			var footer;
			var main;
			var model = this.props.model;
			var tasks = model.tasks || [];
			var isCompleted = model.isCompleted.bind(model);

			var shownTasks = tasks.filter(function (task) {
				var completed = isCompleted(task.id);
				switch (this.state.nowShowing) {
				case app.ACTIVE_TASKS:
					return !completed;
				case app.COMPLETED_TASKS:
					return completed;
				default:
					return true;
				}
			}, this);

			var taskItems = shownTasks.map(function (task) {
				return (
					<TaskItem
						key={task.id}
						task={task}
						onSubtaskToggle={this.toggleSubtask}
					/>
				);
			}, this);

			var activeTaskCount = tasks.reduce(function (accum, task) {
				return task.completed ? accum : accum + 1;
			}, 0);

			var completedCount = tasks.length - activeTaskCount;

			if (activeTaskCount || completedCount) {
				footer =
					<TaskFooter
						count={activeTaskCount}
						completedCount={completedCount}
						nowShowing={this.state.nowShowing}
						onClearCompleted={this.clearCompleted}
					/>;
			}

			if (tasks.length) {
				main = (
					<section className="main">
						<ul className="todo-list">
							{taskItems}
						</ul>
					</section>
				);
			}

			return (
				<div>
					<header className="header">
						<h1>tasks</h1>
						<input
							className="new-todo"
							placeholder="What needs to be done?"
							value={this.state.newTask}
							onKeyDown={this.handleNewTaskKeyDown}
							onChange={this.handleChange}
							autoFocus={true}
						/>
					</header>
					{main}
					{footer}
				</div>
			);
		}
	});

	var model = new app.TaskModel('react-tasks');

	function render() {
		React.render(
			<TaskApp model={model}/>,
			document.getElementsByClassName('todoapp')[0]
		);
	}

	model.subscribe(render);
	render();
})();
