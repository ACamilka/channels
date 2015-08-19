
channelsApp.controller('channelsController', function($scope, $http, $modal){
    // Список каналов
    $scope.channels = [];
    // Список сообщений
    $scope.messages = [];
    // Индекс текущего канала
    $scope.currentChannelIndex = null;
    // Текущая страница
    $scope.currentPage = 0;
    // Общее количество элементов
    $scope.totalItems = 0;
    // Количество элементов на странице
    $scope.itemsPerPage = 10;
    // Количество отображаемых номеров страниц
    $scope.maxPageSize = 10;
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
        }
        $scope.currentChannelIndex = index || $scope.channels.length -1;
        $scope.loadMessages($scope.currentChannelIndex);
    };

    /*
    * Удаление канала
    */
    $scope.deleteChannel = function(index) {
        $scope.channels.splice(index, 1);
        if ($scope.currentChannelIndex == index) {
            $scope.loadItems();
        }
    };

    /*
    * Просмотр списка сообщений канала
    */
    $scope.loadMessages = function(index){
        var channel = $scope.channels[index];
        $scope.currentChannelIndex = index;
        $scope.currentPage = 1;
        $scope.loadItems();
    };

    /*
    * Просмотр сообщения
    */
    $scope.viewMessage = function(index) {
        if (angular.isUndefined($scope.currentChannelIndex)) {
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
            $scope.loadItems();
        });

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
    /*
    * Получение списка уникальных авторов
    */
    $scope.getUniqAuthors = function(entries){
        var uniqAuthors = [];
        for(var i=0; i<entries.length; i++){
            if (entries[i].author && uniqAuthors.indexOf(entries[i].author) == -1) {
                uniqAuthors.push(entries[i].author);
            }
        }
        return uniqAuthors
    };
    /*
    * Загрузка сообщений текущей страниы
    */
    $scope.loadItems = function() {
        if (angular.isUndefined($scope.currentChannelIndex)) return;
        var currentChannel = $scope.channels[$scope.currentChannelIndex],
            start = ($scope.currentPage - 1) * $scope.itemsPerPage,
            end = start + $scope.itemsPerPage;
        var data = currentChannel ? currentChannel.entries: [];
        //Фильтрация прочитанных/непрочитанных сообщений
        if ($scope.userFilter) {
            data = data.filter(function(i){ return !i.isReaded });
        }
        $scope.totalItems = data.length;
        $scope.messages = data.slice(start, end);
    };
    $scope.$watch('userFilter', function(){
        $scope.loadItems();
    });
});