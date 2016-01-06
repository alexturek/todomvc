/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
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

		toggleAll: function (event) {
			var checked = event.target.checked;
			this.props.model.toggleAll(checked);
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

		render: function () {
			var footer;
			var main;
			var tasks = this.props.model.tasks;

			var shownTasks = tasks.filter(function (task) {
				switch (this.state.nowShowing) {
				case app.ACTIVE_TASKS:
					return !task.completed;
				case app.COMPLETED_TASKS:
					return task.completed;
				default:
					return true;
				}
			}, this);

			var taskItems = shownTasks.map(function (task) {
				return (
					<TaskItem
						key={task.id}
						task={task}
						onToggle={this.toggle.bind(this, task)}
						onDestroy={this.destroy.bind(this, task)}
						onEdit={this.edit.bind(this, task)}
						editing={this.state.editing === task.id}
						onSave={this.save.bind(this, task)}
						onCancel={this.cancel}
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
						<input
							className="toggle-all"
							type="checkbox"
							onChange={this.toggleAll}
							checked={activeTaskCount === 0}
						/>
						<ul className="task-list">
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
							className="new-task"
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
			document.getElementsByClassName('taskapp')[0]
		);
	}

	model.subscribe(render);
	render();
})();
