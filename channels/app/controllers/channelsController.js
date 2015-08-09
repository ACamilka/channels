
channelsApp.controller('channelsController', function($scope, $http, $modal){
    // Список каналов
    $scope.channels = [];
    // Список сообщений
    $scope.messages = [];
    $scope.pages;
    // Количество сообщений отображаемых на странице
    $scope.messagesPerPage = 14;
    $scope.startPage = 0;
    $scope.currentPage = $scope.startPage;
    /*
    * Добавление/редактирование канала
    */
    $scope.editChannel = function(index) {
        var channelUrl = '';
        if (angular.isDefined(index)) {
            channelUrl = $scope.channels[index].feedUrl;
        }

        var modalInstance = $modal.open({
            templateUrl: 'addChannelDialog.html',
            controller: 'addChannelDialog',
            size: 'sm',
            resolve: {
                channelUrl: function () {
                    return channelUrl;

                },
                makeRequestFunc: function() {
                    return function(url) {
                        $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=' +
                            'JSON_CALLBACK&q=' + encodeURIComponent(url)).then(function (response) {
                            switch (response.data.responseStatus) {
                                case 200:
                                    $scope.loadChannel(response.data.responseData.feed, index);
                                    break;
                                default:
                                    alert('Введен некорректный адрес!');
                                    break;
                            }
                        });
                    }
                }
            }
        });

    };
    /*
    * Загрузка канала (возможно нужно реализовать c использованием localStorage)
    */
    $scope.loadChannel = function(channel, index) {
        if (angular.isUndefined(index)) {
            $scope.channels.push(channel);
        } else {
            $scope.channels[index] = channel;
            $scope.currentChannel = channel;
            $scope.loadPage(0);
        }
    };

    /*
    * Удаление канала
    */
    $scope.deleteChannel = function(index) {
        var deletedChannel = $scope.channels.splice(index, 1);
        if (deletedChannel.indexOf($scope.currentChannel) != -1) {
            $scope.loadData([]);
        }
    };

    /*
    * Просмотр списка сообщений канала
    */
    $scope.loadMessages = function(index){
        $scope.currentChannel = $scope.channels[index];
        $scope.loadPage();
    };

    /*
    * Просмотр сообщения
    */
    $scope.viewMessage = function(index) {
        if (angular.isUndefined($scope.currentChannel)) {
            alert('Канал не выбран');
        }

        var message = $scope.messages[index];
        message.isReaded = true;

        var modalInstance = $modal.open({
            templateUrl: 'simpleDialog.html',
            controller: 'simpleDialog',
            size: 'sm',
            resolve: {
                params: function(){
                    return {
                        title: 'Сообщение',
                        content: message.content
                    }
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.loadData($scope.currentChannel.entries);
        });

    };

    /*
    * Загрузка страници с сообщениями
    */
    $scope.loadPage = function(pageNumber) {
        if (angular.isUndefined(pageNumber)) {
            pageNumber = $scope.startPage;
        }
        $scope.currentPage = pageNumber;
        $scope.loadData($scope.currentChannel.entries);
        angular.element(document.querySelectorAll(".pagination>li.active")).removeClass('active');
        angular.element(document.querySelectorAll("[data-page-id='{}']".replace('{}', pageNumber))).addClass('active');
    };

    /*
    * Статистика канала
    */
    $scope.statChannel = function(index) {
        var entries = $scope.channels[index].entries;
        var uniqAuthors = $scope.getUniqAuthors(entries)
        var authorsCount = uniqAuthors.length ? uniqAuthors.length: 'Автор не указан';

        var modalInstance = $modal.open({
            templateUrl: 'simpleDialog.html',
            controller: 'simpleDialog',
            size: 'sm',
            resolve: {
                params: function(){
                    return {
                        title: 'Статистика',
                        content: 'Количество сообщений: '+ entries.length + '. <br>Количество авторов: ' + authorsCount
                    }
                }
            }
        });
    };

    /*
    * Статистика сообщения
    */
    $scope.statMessage = function(message) {
        var letters = {},
            lettersArray = onlyAlphabet(message.content.toLowerCase());
        for (var i=0; i<lettersArray.length; i++) {
            if (angular.isDefined(letters[lettersArray[i]])) {
                letters[lettersArray[i]] ++;
            } else {
                letters[lettersArray[i]] = 1;
            }
        }
        letters = Object.keys(letters).map(function(key) {
            return [key, letters[key]];
        });

        var modalInstance = $modal.open({
            templateUrl: 'highChart.html',
            controller: 'chartDialog',
            size: 'lg',
            resolve: {
                params: function(){
                    return {
                        title: 'Статистика сообщения',
                        lettersData: letters
                    }
                }
            }
        });
    };

    $scope.$watch('userFilter', function(newVal){
        var data = $scope.currentChannel ? $scope.currentChannel.entries : [];
        $scope.loadData(data);
    });

    $scope.loadData = function(data) {
        if ($scope.userFilter) {
            data = data.filter(function(i){ return !i.isReaded });
        }
        // Вычисление количества страниц
        $scope.pages = new Array(Math.ceil(data.length /$scope.messagesPerPage) | 0);
        // Получаение среза сообщений
        $scope.messages = $scope.getSliceData(data);
    };

    $scope.getSliceData = function(data) {
        var start = $scope.currentPage * $scope.messagesPerPage;
        return data.slice(start, start + $scope.messagesPerPage);
    };

    $scope.getUniqAuthors = function(entries){
        var uniqAuthors = [];
        for(var i=0; i<entries.length; i++){
            if (entries[i].author && uniqAuthors.indexOf(entries[i].author) == -1) {
                uniqAuthors.push(entries[i].author);
            }
        }
        return uniqAuthors
    };
});