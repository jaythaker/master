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

	// TODO: Notify the user that we are starting the process.
	blockProcessing.resetProcessingState();

	blockProcessing.processNext(processingType, dfd);

	$.when(dfd).then(
        function (status) {
		// TODO: Notify user that we timed out
        },
        function (status) {
		// TODO: Notify user on error
	},
        function (status) {
        	blockProcessing.processNext(processingType, dfd);
        }
    );

    setTimeout(function () {
	if (dfd.state() === "pending") {
		dfd.reject();
	}
	else {
		dfd.resolve();
	}
	}, blockProcessing.defaultTimeout);

};
