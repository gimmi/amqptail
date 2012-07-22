"use strict";

var amqp = require('amqp'),
	xml2js = require('xml2js'),
	argv = require('optimist')
		.usage('Subscribe to AMQP exchange and output messages to the console')
		.demand('exchange').alias('exchange', 'x').describe('exchange', 'Exchange name')
		.alias('routingkey', 'r').describe('routingkey', 'Routing key').default({ routingkey: '#' })
		.argv;

amqp.createConnection({url: "amqp://guest:guest@localhost:5672"}, null, function (connection) {
	connection.queue('tail', { exclusive: true }, function (queue) {
		queue.bind(argv.exchange, argv.routingkey);
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

