"use strict";

var amqp = require('amqp'),
	xml2js = require('xml2js'),
	argv = require('optimist')
		.usage('Subscribe to AMQP exchange and output messages to the console')
		.demand('x').describe('x', 'Exchange name')
		.describe('c', 'The connection string')
		.describe('r', 'Routing key')
		.default({ r: '#', c: 'amqp://guest:guest@localhost:5672' })
		.argv;

amqp.createConnection({url: argv.c}, null, function (connection) {
	connection.queue('tail', { exclusive: true }, function (queue) {
		queue.bind(argv.x, argv.r);
		queue.subscribe(function (messageBytes, headers, deliveryInfo) {
			var parser = new xml2js.Parser({ explicitArray: true, mergeAttrs: true }),
				messageString = messageBytes.data.toString(messageBytes.contentEncoding || 'utf-8');
			//var contentType = message.contentType;

			parser.parseString(messageString, function (err, events) {
				events.event.forEach(function (event) {
					console.log('%s %s %s %s', event.level, event.logger, event.thread, event.message);
				});
			});
		});
	});
});

