import './App.css';
import React, { useEffect, useState } from 'react';
import greenCheck from './assets/green-check.png';
import trash from './assets/trash.png';
import restore from "./assets/restore.png"

// LOGIC --------------------------------------------------------------------------------

function generateId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = getRandomInt(0, charactersLength);
    result += characters.charAt(randomIndex);
  };
  return result;
};
function getRandomInt(minn: number, maxx: number) {
  minn = Math.ceil(minn);
  maxx = Math.floor(maxx);
  return Math.floor(Math.random() * (maxx - minn + 1)) + minn;
};

function prettifyDate(dateInput: string) {
    const monthArr = [
        '', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const year = dateInput.slice(0, 4);
    const month = monthArr[parseInt(dateInput.slice(5, 7))];
    const date = dateInput.slice(8, 10);

    let dateString;
    if (date[0] !== "1" && date[1] === "1") {
        dateString = date + 'st';
    } else if (date[0] !== "1" && date[1] === "2") {
        dateString = date + 'nd';
    } else if (date[0] !== "1" && date[1] === "3") {
        dateString = date + 'rd';
    } else {
        dateString = date + 'th'
    }

    if (dateString[0] === "0") {dateString = dateString.slice(1)}

    return `${month} ${dateString}, ${year}`
}

interface notifFormat {
    id?: string;
    notifType: "add" | "check" | "restore" | "delete";
    notifTask: taskFormat;
}

function useLogicPackage() {
    const [taskArray, setTaskArray] = useState<taskFormat[]>(() => {
        const taskArrStorage = localStorage.getItem('tasks');
        return taskArrStorage? JSON.parse(taskArrStorage) : [];
    });

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(taskArray));
    }, [taskArray])

    const [taskNotifs, setTaskNotifs] = useState<notifFormat[]>([]);

    // notifs

    function fireNotif({notifType, notifTask} : Omit<notifFormat, 'id'>) {
        const id = generateId(5);

        const newNotifArray = [...taskNotifs, {id, notifType, notifTask}]
        setTaskNotifs(newNotifArray);

        setTimeout(() => {
            removeNotif(id);
        }, 5600);
    };

    function removeNotif(id: string) {
    setTaskNotifs(prev => prev.filter(n => n.id !== id));
}
    // end notifs

    function addTask(newTask: taskFormat) {
        const newTaskArray = [...taskArray, newTask];
        setTaskArray(newTaskArray);
    };

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const newTask = {
            id: generateId(5),
            title: formData.get('taskNameInput') as string,
            date: formData.get('taskDateInput') as string,
            isFinished: false
        };
        addTask(newTask);
        const data = Object.fromEntries(formData.entries());
        console.log("Added data")
        console.log(data);
        console.log(taskArray);

        fireNotif({notifType: "add", notifTask: newTask});

        e.currentTarget.reset();
    };

    function handleTaskChecks(id: string, isFinished: boolean) {
        const newTaskArray = taskArray.map((task) => {
            if (task.id === id) {
                task.isFinished = !isFinished

                if (isFinished) {
                    fireNotif({notifType: "restore", notifTask: task});
                } else {
                    fireNotif({notifType: "check", notifTask: task});
                }
            } 
            return task
        });
        setTaskArray(newTaskArray);

        console.log(newTaskArray);
    };

    function handleTaskRemoval(id: string) {
        const newTaskArray = taskArray.filter((task) => {
            if (task.id === id) {
                fireNotif({notifType: "delete", notifTask: task});
            }
            return task.id !== id
        });

        setTaskArray(newTaskArray);

        console.log(newTaskArray)
    };
    return {taskArray, handleSubmit, handleTaskChecks, handleTaskRemoval, taskNotifs};
}

// VISUALS ===================================================================================

// tasks --------------------------------------------------------------------------------

interface taskFormat {
    id: string;
    title: string;
    date: string;
    isFinished: boolean;
}

interface taskRenderer {
    taskArr: taskFormat[]
    handleTaskChecks: (id: string, isFinished: boolean) => void;
    handleTaskRemoval: (id: string) => void
}

interface taskPackage extends Omit<taskRenderer, "taskArr">, taskFormat {
    checkImage: string
};

function Task({id, title, date, handleTaskChecks, handleTaskRemoval, checkImage, isFinished}: taskPackage) {
    const [isDisappearing, setIsDisappearing] = useState<boolean>(false);

    return (
        <div id={id} className={`w-100% p-2 py-3 flex justify-between gap-2 
        border-2 border-gray-700 rounded-2xl shadow-black/20
        bg-linear-to-b from-gray-200 from-5% to-white
        transition-all duration-150 ${isDisappearing ? "animate-disappear" : "animate-appear"}`}
        onAnimationEnd={() => {
            if (isDisappearing) {
                handleTaskRemoval(id);
            }
        }}
        >
            <div>
                <h3><strong>{title}</strong></h3>
                <h4>{prettifyDate(date)}</h4>
            </div>
            <div className='flex gap-3 grow-0 basis-30'>
                <button className='cursor-pointer w-[50%]' onClick={() => handleTaskChecks(id, isFinished)}><img className='' src={checkImage}/></button>
                <button className='cursor-pointer w-[50%]' onClick={() => setIsDisappearing(true)}><img className='' src={trash}/></button>
            </div>
            
        </div>
    )
}

function TasksDashboard({taskArr, handleTaskChecks, handleTaskRemoval}: taskRenderer) {
    const pendingTaskArr = taskArr.map((task) => {
        if (!task.isFinished) {
            return (
                <li className="list-none mb-3" key={task.id}>
                    <Task id={task.id} title={task.title} date={task.date} checkImage={greenCheck} isFinished={task.isFinished}
                    handleTaskChecks={() => handleTaskChecks(task.id, task.isFinished)} handleTaskRemoval={() => handleTaskRemoval(task.id)}/>
                </li>
            )
        }
    })

    const finishedTaskArr = taskArr.map((task) => {
        if (task.isFinished) {
            return (
                <li className="list-none mb-3" key={task.id}>
                    <Task id={task.id} title={task.title} date={task.date} checkImage={restore} isFinished={task.isFinished}
                    handleTaskChecks={handleTaskChecks} handleTaskRemoval={handleTaskRemoval}/>
                </li>
            )
        }
    })
    
    return (
        <>
            <article className='flex flex-col p-5 border-2 rounded-2xl w-[50%] min-w-2xs shadow-black/25 shadow-lg bg-linear-to-b from-gray-200 from-5% to-white'>
                <h1 className='m-4.5 text-[1.5rem] font-bold'>Tugas yang belum dilakukan:</h1>
                {pendingTaskArr}
            </article>
            <article className='flex flex-col p-5 border-2 rounded-2xl w-[50%] min-w-2xs shadow-black/25 shadow-lg bg-linear-to-b from-gray-200 from-5% to-white'>
                <h1 className='m-4.5 text-[1.5rem] font-bold'>Tugas yang sudah dilakukan:</h1>
                {finishedTaskArr}
            </article>
        </>
    )
}

// forms ----------------------------------------------------------------------------------------
interface FormInputs {
    name: string;
    label: string;
    type: string;
    errorMessage: string;
}

function FormInput({name, label, type, errorMessage}: FormInputs) {

    const [isNotFirstEnter, setIsNotFirstEnter] = useState<boolean>(false);
    const [taskName, setTaskName] = useState<string>("");
    const isError: string = isNotFirstEnter && taskName.length < 1 ? '' : 'opacity-0'; 

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {

        if (isNotFirstEnter) {
            setTaskName(e.target.value);
            return
        }

        setIsNotFirstEnter(true);
        setTaskName(e.target.value);
    }

    return (
        <>
            <label htmlFor="taskName">{label}</label>
            <input
            className='border rounded-[0.3rem] h-8 mb-2 transition-all duration-100 ease-in focus:outline-0 
            focus:border-indigo-600 focus:bg-indigo-50 focus:shadow-indigo-500 p-2'
            id="FormInput"
            name={name}
            onChange={handleChange}
            type={type}
            required

            />
            <label className={'taskName text-red-500 transition-all duration-100 ease-out ' + isError} htmlFor='taskName'>{errorMessage}</label>
        </>
    )
}

function TodoForm({handleSubmit}: {handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void} ) {
    return (
        <article className='flex flex-col p-5 border-2 rounded-2xl w-[50%] min-w-2xs shadow-black/25 shadow-lg'>
            <h1 className='m-4.5 text-[1.5rem] font-bold text-center'>Tambah yang harus dilakukan</h1>
            <form 
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 gap">
                <FormInput label="Masukkan tugas yang harus diselesaikan" type="text" name="taskNameInput" errorMessage='Nama tidak boleh kosong!' />
                <FormInput label="Masukkan tanggal tenggat waktu tugas" type="date" name="taskDateInput" errorMessage='Tanggal tidak boleh kosong!' />
                <button 
                className='p-[0.33rem] px-[0.6rem] mw-[200px] self-end border-2 border- border-[ridge] rounded-2xl text-indigo-500 transition-all duration-100 ease-in
                hover:border-white hover:text-white hover:bg-indigo-600 hover:cursor-pointer'
                type='submit'>Create Task</button>
            </form>
        </article>
        
    )
}

// notification -----------------------------------------------------------------------------

function Notification({notifType, notifTask}: notifFormat) {
    let message;
    if (notifType === "add") {
        message = "added";
    } else if (notifType === "restore") {
        message = "restored";
    } else if (notifType === "delete") {
        message = "deleted";
    } else {
        message = "marked as finished";
    }
    return (
        <div className='relative rounded-4xl bg-indigo-400 px-4 py-1 text-white transition-all duration-150 animate-notif' 
        >
            <p>Task <i>{notifTask.id}</i> : {notifTask.title} has been {message}.</p>
        </div>
    );
};

function NotificationSection({taskNotifs}: {taskNotifs: notifFormat[]}) {
    const notifArr = taskNotifs.map((notif) =>{
        return (
            <Notification key={notif.id} notifType={notif.notifType} notifTask={notif.notifTask}/>
        );
    })

    return (
        <aside id="notifications" className='fixed left-3 bottom-3 flex flex-col h-fit w-fit h-min-7 gap-3'>
            {notifArr}
        </aside>
    );
};

function Content() {
    const {taskArray, handleSubmit, handleTaskRemoval, handleTaskChecks, taskNotifs} = useLogicPackage();
    return (
        <div id="content" className='flex flex-col w-100% justify-center items-center p-4 gap-8'>
            <TodoForm handleSubmit={handleSubmit} />
            <TasksDashboard taskArr={taskArray} handleTaskChecks={handleTaskChecks} handleTaskRemoval={handleTaskRemoval}/>
            <NotificationSection taskNotifs={taskNotifs} />
        </div>
    );
};

export default function Main() {
    return (
        <>
            <header id="header" className="w-full bg-indigo-600 p-3 text-white ps-4"><h1 className='font-extrabold text-[2rem]'>Todo List</h1></header>
            <Content />
        </>
    );
};