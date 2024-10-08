const apiUrl = 'http://www.7timer.info/bin/api.pl';
const openCageApiKey = ''; 

const taskInput = document.getElementById('new-task');
const taskList = document.getElementById('task-list');
const removeCompletedButton = document.getElementById('remove-completed');

// Обновление фона
function updateBackground() {
    const now = new Date();
    const hour = now.getHours();
    let backgroundUrl;

    if (hour >= 0 && hour < 6) {
        backgroundUrl = 'Resources/night.jpg';
    } else if (hour >= 6 && hour < 12) {
        backgroundUrl = 'Resources/morning.jpg';
    } else if (hour >= 12 && hour < 18) {
        backgroundUrl = 'Resources/afternoon.jpg';
    } else {
        backgroundUrl = 'Resources/evening.jpg';
    }

    document.getElementById('background-slider').style.backgroundImage = `url(${backgroundUrl})`;
}

// Обновление даты и времени
function updateTimeDate() {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

// Получение координат города по умолчанию
function getCoordinatesByCity(city) {
    const cities = {
        "Краснодар": { lat: 45.035470, lon: 38.975313 },
    };
    return cities[city] || cities["Краснодар"];
}

// Сохранение города в localStorage
function saveCityToLocalStorage(city) {
    localStorage.setItem('city', city);
}

// Получение города из localStorage
function getCityFromLocalStorage() {
    return localStorage.getItem('city') || defaultCity;
}

// Определение текущего местоположения с помощью геолокации
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(lat, lon);
            },
            () => {
                // Если доступ к геолокации отклонен, используется город по умолчанию (Краснодар)
                const city = getCityFromLocalStorage();
                const coords = getCoordinatesByCity(city);
                fetchWeather(coords.lat, coords.lon);
            }
        );
    } else {
        // Если браузер не поддерживает геолокацию
        const city = getCityFromLocalStorage();
        const coords = getCoordinatesByCity(city);
        fetchWeather(coords.lat, coords.lon);
    }
}

// Получение координат по названию города с использованием OpenCage API
function getCoordinatesFromApi(city, callback) {
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${openCageApiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const lat = data.results[0].geometry.lat;
                const lon = data.results[0].geometry.lng;
                callback(lat, lon);
            } else {
                alert('Не удалось найти город!');
            }
        })
        .catch(error => {
            console.error('Ошибка получения координат:', error);
        });
}

// Получение погоды по широте и долготе через API 7Timer!
function fetchWeather(lat, lon) {
    fetch(`${apiUrl}?lon=${lon}&lat=${lat}&product=civil&output=json`)
        .then(response => response.json())
        .then(data => {
            const weatherData = data.dataseries[0];
            const temperature = weatherData.temp2m;
            const weatherType = weatherData.weather;

            document.getElementById('temperature').textContent = `${temperature}°C`;
            document.getElementById('weather').textContent = translateWeather(weatherType);
        })
        .catch(error => {
            console.error('Ошибка получения данных о погоде:', error);
        });
}

// Получение погоды по названию города
function fetchWeatherByCity() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        getCoordinatesFromApi(city, (lat, lon) => {
            fetchWeather(lat, lon);
            saveCityToLocalStorage(city);
        });
    } else {
        alert('Введите название города!');
    }
}

// Преобразование кода погоды 7Timer! в текстовое описание
function translateWeather(weatherCode) {
    const weatherTypes = {
        "clearnight": "Ясно",
        "clearday": "Ясно",
        "pcloudyday": "Переменная облачность",
        "pcloudynight": "Переменная облачность",
        "mcloudyday": "Умеренная облачность",
        "mcloudynight": "Умеренная облачность",
        "cloudyday": "Облачно",
        "cloudynight": "Облачно",
        "humidday": "Влажно",
        "humidnight": "Влажно",
        "lightrainday": "Слабый дождь",
        "lightrainnight": "Слабый дождь",
        "oshowerday": "Проливной дождь",
        "oshowernight": "Проливной дождь",
        "ishowerday": "Непродолжительный дождь",
        "ishowernight": "Непродолжительный дождь",
        "lightsnowday": "Лёгкий снег",
        "lightsnownight": "Лёгкий снег",
        "rainday": "Дождь",
        "rainnight": "Дождь",
        "snowday": "Снег",
        "snownight": "Снег",
        "rainsnowday": "Мокрый снег",
        "rainsnownight": "Мокрый снег",
        "tsday": "Гроза",
        "tsnight": "Гроза",
        "tsrainday": "Гроза с дождём",
        "tsrainnight": "Гроза с дождём",
        "fogday": "Туман",
        "fognight": "Туман",
    };
    return weatherTypes[weatherCode] || "Неизвестная погода";
}

// Добавление задачи при нажатии на "Enter"
taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const task = taskInput.value.trim();
        if (task === '') {
            alert('Задача не может быть пустой');
            return;
        }

        // Создание элемент задачи
        const taskItem = document.createElement('li');

        // Создание чекбокса
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.addEventListener('change', () => {
            taskItem.classList.toggle('completed');
        });

        // Создание текста задачи
        const taskText = document.createElement('span');
        taskText.textContent = task;

        // Создание кнопки удаления задачи
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => {
            taskList.removeChild(taskItem);
        });

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);
        taskList.appendChild(taskItem);

        // Очищение поле ввода
        taskInput.value = '';
    }
});

// Удаление выполненных задач
removeCompletedButton.addEventListener('click', () => {
    const completedTasks = document.querySelectorAll('#task-list li.completed');

    if (completedTasks.length === 0) {
        alert("Выполненных задач нет."); 
    } else {
        completedTasks.forEach(task => task.remove());
    }
});

setInterval(updateTimeDate, 1000);
updateTimeDate();

setInterval(updateBackground, 60000); // Обновление фона раз в минуту
updateBackground();

// Установка погоды при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    getCurrentLocationWeather();
});