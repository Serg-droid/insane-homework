document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    class CitiesApi{
        constructor(){
            this.data = '';
            this.lang = "RU";
            this.allCitiesObj = '';
        }
        //инициализация проекта
        init(){
            this.getData('../db_cities.json', this.handleData);
        }

        //получает данные с сервера, коллбэк обрабатывает
        getData(url, cb, method = 'GET', data = '', contentType = 'application/json'){
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', contentType);

            xhr.addEventListener('readystatechange', () => {
                if(xhr.readyState !== 4){
                    return;
                }
                if(xhr.status !== 200){
                    console.error(`Запрос завершился с ошибкой: ${xhr.status}`);
                }else{
                    cb.call(this, JSON.parse(xhr.responseText));
                }
            });

            if(method === 'POST'){
                xhr.send(data);
            }else{
                xhr.send();
            }
        }
        //обрабатывает данные в удобный для нас формат
        handleData(data){
            this.data = data[this.lang].reduce((acc, elem) => {
                acc[elem.country] = elem;
                return acc;
            }, {});
            const countries = Object.values(this.data);
            this.allCitiesObj = countries.reduce((acc, country) => {
                for(const city of country.cities){
                    acc[city.name] = city;
                }
                return acc;
            }, {});
            this.makeDefault();
            this.showData();
        }
        //создает блок див с указанным текстом и стилем
        makeDivBlock(classNode = '', text = '', whereAppendTo){
            const div = document.createElement('div');
            div.textContent = text;
            div.classList.add(classNode);
            if(whereAppendTo){
                whereAppendTo.append(div);
            }else{
                return div;
            }
        }
        //создает один экземпляр страна + города
        makeOneCountry(country, cities, collector){
            const count = this.data[country].count;

            const fragment = document.createDocumentFragment();

            const countryBlock = this.makeDivBlock('dropdown-lists__countryBlock');

            const dropdownTotalLine = this.makeDivBlock('dropdown-lists__total-line');
            this.makeDivBlock('dropdown-lists__country', country, dropdownTotalLine);
            this.makeDivBlock('dropdown-lists__count', count, dropdownTotalLine);
            countryBlock.append(dropdownTotalLine);

            for(const city of cities){
                const dropdownLine = this.makeDivBlock('dropdown-lists__line');
                this.makeDivBlock('dropdown-lists__city', city.name, dropdownLine);
                this.makeDivBlock('dropdown-lists__count', city.count, dropdownLine);
                countryBlock.append(dropdownLine);
            }
            collector.append(countryBlock);
        }
        //формирует дропдаун дефолт
        makeDefault(){
            const   fragment = document.createDocumentFragment(),
                    dropdownDefault = document.querySelector('.dropdown-lists__list--default > .dropdown-lists__col');
            
            const countriesObj = this.data;
            for(const country in countriesObj){
                let citiesArr = countriesObj[country].cities;
                citiesArr.sort((cityA, cityB) => +cityA.count > +cityB.count ? -1 : 1);
                citiesArr = citiesArr.slice(0, 3);
                this.makeOneCountry(country, citiesArr, fragment);
            }
            
            dropdownDefault.append(fragment);
            dropdownDefault.style.display = 'none';
        }
        //формирует дропдаун селект
        makeSelect(country){
            const dropdownSelect = document.querySelector('.dropdown-lists__list--select > .dropdown-lists__col'),
                fragment = document.createDocumentFragment();

            dropdownSelect.innerHTML = '';

            const countryData = this.data[country];
            this.makeOneCountry(country, countryData.cities, fragment);
            
            dropdownSelect.append(fragment);
        }
        //формирует автокомплит
        makeAutocomplete(whatToFind){
            const dropdownAutocomplete = document.querySelector('.dropdown-lists__list--autocomplete > .dropdown-lists__col'),
                countryBlock = this.makeDivBlock('.dropdown-lists__countryBlock');
            
            dropdownAutocomplete.innerHTML = '';
            const set = new Set();

            for(let city in this.allCitiesObj){
                if(city.toLowerCase().startsWith(whatToFind.toLowerCase())){
                    set.add({ city, count: this.allCitiesObj[city].count });
                }
            }

            if(set.size){
                set.forEach(({ city, count }) => {
                    const dropdownLine = this.makeDivBlock('dropdown-lists__line');
                    this.makeDivBlock('dropdown-lists__city', city, dropdownLine);
                    this.makeDivBlock('dropdown-lists__count', this.allCitiesObj[city].count, dropdownLine);
                    countryBlock.append(dropdownLine);
                });
            }else{
                countryBlock.textContent = 'Ничего не найдено';
            }

            dropdownAutocomplete.append(countryBlock);
            document.querySelector('.dropdown-lists__list--autocomplete').style.display = 'block';
        }
        //навешивает обработчики
        showData(){
            const   dropdown = document.querySelector('.dropdown'),
                    selectCities = document.getElementById('select-cities'),
                    dropdownDefault = dropdown.querySelector('.dropdown-lists__list--default > .dropdown-lists__col'),
                    dropdownSelect = dropdown.querySelector('.dropdown-lists__list--select'),
                    dropdownAutocomplete = dropdown.querySelector('.dropdown-lists__list--autocomplete'),
                    dropdownTotalDefault = dropdown.querySelectorAll('.dropdown-lists__list--default .dropdown-lists__total-line'),
                    closeButton = document.querySelector('.close-button'),
                    inputLabel = document.querySelector('.label'),
                    linkButton = document.querySelector('a[class=button]');
            
            linkButton.style.cssText = 'pointer-events: none;';   
            
            //показывает дропдаун дефолт при клике
            selectCities.addEventListener('click', () => {
                dropdownDefault.style.display = 'block';
                dropdownSelect.style.display = 'none';
            });

            //активирует автокомплит при вводе значения в инпут
            selectCities.addEventListener('input', () => {
                if(selectCities.value === ''){
                    linkButton.style.cssText = 'pointer-events: none;';
                    dropdownDefault.style.display = 'block';
                    dropdownAutocomplete.style.display = 'none';
                    return;
                }else if(Object.keys(this.allCitiesObj).includes(selectCities.value)){
                    linkButton.style.cssText = 'pointer-events: none;';
                    return;
                }
                this.makeAutocomplete(selectCities.value);
                dropdownDefault.style.display = 'none';
                dropdownSelect.style.display = 'none';
            });

            //обработчики на названия страны в селекте и дефолте
            dropdownTotalDefault.forEach(item => {
                const country = item.querySelector('.dropdown-lists__country').textContent;
                item.addEventListener('click', () => {
                    this.makeSelect(country);
                    dropdownDefault.style.display = 'none';
                    dropdownSelect.style.display = 'block';
                    const dropdownTotalSelect = document.querySelector('.dropdown-lists__list--select .dropdown-lists__total-line');
                    dropdownTotalSelect.addEventListener('click', () => {
                        dropdownDefault.style.display = 'block';
                        dropdownSelect.style.display = 'none';
                    });
                });
            });

            //обработчики событий на все страны - города
            dropdown.addEventListener('click', (e) => {
                const target = e.target;
                if(!target.matches('.dropdown-lists__city, .dropdown-lists__country')){
                    return;
                }   
                if(target.matches('.dropdown-lists__city')){
                    linkButton.href = this.allCitiesObj[target.textContent].link;
                    linkButton.style.cssText = 'pointer-events: auto;'
                }
                inputLabel.textContent = '';
                selectCities.value = target.textContent;
                closeButton.style.display = 'block';
            });

            //обработчик на кнопку крестик в инпуте
            closeButton.addEventListener('click', () => {
                selectCities.value = '';
                closeButton.style.display = 'none';
                dropdownAutocomplete.style.display = 'none';
                dropdownSelect.style.display = 'none';
                dropdownDefault.style.display = 'none';
                inputLabel.textContent = 'Страна или город';
                linkButton.style.cssText = 'pointer-events: none;';
            });

            //зачищаем все поля при клике на "Перейти"
            linkButton.addEventListener('click', () => {
                selectCities.value = '';
                closeButton.style.display = 'none';
                dropdownAutocomplete.style.display = 'none';
                dropdownSelect.style.display = 'none';
                dropdownDefault.style.display = 'none';
                inputLabel.textContent = 'Страна или город';
            });
        }
    }

    const start = new CitiesApi();
    start.init();

});