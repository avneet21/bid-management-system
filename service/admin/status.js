'use strict';
// public api
var status = {
  find: function(req, res, next){
    req.query.pivot = req.query.pivot ? req.query.pivot : '';
    req.query.name = req.query.name ? req.query.name : '';
      req.query.title = req.query.title ? req.query.title : '';
      req.query.description = req.query.description ? req.query.description : '';
      req.query.amount = req.query.amount ? req.query.amount : '';
      req.query.createdOn = req.query.createdOn ? req.query.createdOn : '';
      req.query.createdBy = req.query.createdBy ? req.query.createdBy : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.pivot) {
      filters.pivot = new RegExp('^.*?'+ req.query.pivot +'.*$', 'i');
    }

    if (req.query.name) {
      filters.name = new RegExp('^.*?'+ req.query.name +'.*$', 'i');
    }
      if (req.query.title) {
          filters.title = new RegExp('^.*?'+ req.query.title +'.*$', 'i');
      }
      if (req.query.description) {
          filters.description = new RegExp('^.*?'+ req.query.description +'.*$', 'i');
      }

      if (req.query.createdOn) {
          filters.createdOn = new RegExp('^.*?'+ req.query.createdOn +'.*$', 'i');
      }
      if(!req.user.isAdmin){
          filters.createdBy = req.user.username;
      }
      if (req.query.amount) {
          filters.amount = new RegExp('^.*?'+ req.query.amount +'.*$', 'i');
      }

    req.app.db.models.Status.pagedFind({
      filters: filters,
      keys: 'pivot name title description amount createdOn createdBy',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function(err, results) {
      if (err) {
        return next(err);
      }

      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  read: function(req, res, next){
    req.app.db.models.Status.findById(req.params.id).exec(function(err, status) {
      if (err) {
        return next(err);
      }
      res.status(200).json(status);
    });
  },

  create: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);



    workflow.on('createStatus', function() {
      var fieldsToSet = Object.assign({
          _id : Math.random(),
          createdOn : new Date(),
          createdBy : req.user.username
      },req.body)

      req.app.db.models.Status.create(fieldsToSet, function(err, status) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = status;
        return workflow.emit('response');
      });
    });

    workflow.emit('createStatus');
  },

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);



    workflow.on('patchStatus', function() {
      var fieldsToSet = Object.assign({
      },req.body)
      var options = { new: true };

      req.app.db.models.Status.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, status) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.status = status;
        return workflow.emit('response');
      });
    });

    workflow.emit('patchStatus');
  },

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not delete bids.');
        return workflow.emit('response');
      }

      workflow.emit('deleteStatus');
    });

    workflow.on('deleteStatus', function(err) {
      req.app.db.models.Status.findByIdAndRemove(req.params.id, function(err, status) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('deleteStatus');
  }
};
module.exports = status;