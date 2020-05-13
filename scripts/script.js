document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    class Cities{
        constructor(){
            this.data = '';
        }
        //активирует вечеринку
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
        

        
        
        //обрабатывает полученные с сервера данные 
        handleData(){
            this.makeDefault(this.data);
            this.showData(this.data);
        };
    }

    const disco = new Cities();
    disco.init();

});