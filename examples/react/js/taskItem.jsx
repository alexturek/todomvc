/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global _, React */
var app = app || {};

(function () {
	'use strict';

	var ESCAPE_KEY = 27;
	var ENTER_KEY = 13;

	app.TaskItem = React.createClass({
		renderSubtask: function(subtask) {
			return (
				<div 
						className={classNames({
							completed: subtask.completed,
							subtask: true,
						})}
						key={subtask.id}
					>
					<input
						type="checkbox"
						checked={subtask.completed}
						onChange={_.partial(this.props.onSubtaskToggle, subtask.id)}
						/>
					{subtask.title}
				</div>
			);
		},

		handleAddSubtask: function() {
			this.props.onAddSubtask();
		},

		render: function () {
			var subtasks = _.map(this.props.task.subtasks, this.renderSubtask);
			var completeCount = app.Utils.completedSubtasks(this.props.task).length;
			return (
				<li className={classNames({
					completed: this.props.task.completed,
					editing: this.props.editing
				})}>
					<div className="view">
						<label>
							({completeCount}/{subtasks.length}) {this.props.task.title}
						</label>
						<label>
							<button className={'newSubTask'} onClick={this.handleAddSubtask}>Add subtask</button>
						</label>
						<ul>
							{subtasks}
						</ul>
					</div>
					<span
						ref="editField"
						className="edit">
						{this.props.task.title}
					</span>
				</li>
			);
		}
	});
})();
