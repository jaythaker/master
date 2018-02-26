blockProcessing = {
    callbacks: [],
    currentIndex: 0,
	defaultTimeout: 30000
};

blockProcessing.registerCallbacks = function (processingType, callback) {
    if (blockProcessing.callbacks[processingType] === undefined) {
    	blockProcessing.callbacks[processingType] = [];
    }
    blockProcessing.callbacks[processingType].push(callback);
};

blockProcessing.resetProcessingState = function () {
    blockProcessing.currentIndex = 0;
};

blockProcessing.processNext = function (processingType, dfd) {
	if (blockProcessing.currentIndex > blockProcessing.callbacks[processingType].length - 1) {
        dfd.resolve();
        return;
    }
	blockProcessing.callbacks[processingType][blockProcessing.currentIndex++](dfd);
};

blockProcessing.startProcessing = function (processingType) {
	var dfd = jQuery.Deferred();

	$("#clientarea").block({
		message: $('#blockMessage'),
		css: { border: '3px solid #a00' }
	});

	blockProcessing.resetProcessingState();

	blockProcessing.processNext(processingType, dfd);

	$.when(dfd).then(
        function (status) {
        	//blockProcessing.UpdateMessageBlock('', false);
        	$("#clientarea").unblock();
        	console.log("DataSubmitAsync: UnBlocking the UI on Successfully submiting and refreshing the data.");
        },
        function (status) {
        	//blockProcessing.UpdateMessageBlock('', false);
        	$("#clientarea").unblock();
        	console.log("DataSubmitAsync: UnBlocking the UI on un-successfully submiting or refreshing the data.");
        },
        function (status) {
        	console.log("DataSubmitAsync: Refreshing the data.");
        	blockProcessing.processNext(processingType, dfd);
        }
    );

	setTimeout(function () {
		if (dfd.state() === "pending") {
			console.log("DataSubmitAsync: Rejecting due to unable to complete the operations in given timeframe.");
			dfd.reject();
		}
		else {
			console.log("DataSubmitAsync: New or updated data submitted and refreshed successfully.");
			dfd.resolve();
		}
	}, blockProcessing.defaultTimeout);

};
