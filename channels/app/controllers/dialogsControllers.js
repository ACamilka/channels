channelsApp.controller('addChannelDialog', function ($scope, $modalInstance, channelUrl, makeRequestFunc) {
    $scope.channelUrl = channelUrl;
    $scope.ok = function () {
        if (channelUrl != $scope.channelUrl){
            makeRequestFunc($scope.channelUrl);
        }
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

channelsApp.controller('simpleDialog', function ($scope, $modalInstance, params) {
    $scope.params = params;

    $scope.ok = function () {
        $modalInstance.close();
    };
});

channelsApp.controller('chartDialog', function ($scope, $modalInstance, params) {
    $scope.params = params;
    $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.lettersData = params.lettersData;
});