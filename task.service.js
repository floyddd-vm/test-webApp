const min_delay_time = 2 * 60 * 1000;

class TaskService {
    
    constructor() {
        
    }

    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    } 

    async task1(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 1 * 1000));
    }

    async task2(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 2 * 1000));
    };

    async task3(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 3 * 1000));
    };

    async task4(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 4 * 1000));
    }

    async task5(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 5 * 1000));
    }

    async task6() {
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 6 * 1000));
    };

    async task7(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 7 * 1000));
    };

    async task8(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 8 * 1000));
    };

    async task9(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 9 * 1000));
    };

    async task10(){
        await new Promise(resolve => setTimeout(resolve, min_delay_time + 10 * 1000));
    };
}

module.exports.TaskService = TaskService;