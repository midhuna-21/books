
interface Detail{
   name:string,
   age:number
   getName?:()=>void;
}

let userDetail:Detail={
   name:'midhuna',
   age:22,
   getName() {
      console.log(this.name);
   },
}

//functions

// function getUserName(userDetail:Detail){
//    return userDetail.name
// }
// getUserName(userDetail)

function getUserName({name,age}: {name:string; age:number}):string | number{
   return userDetail.name
}

getUserName({name:"midhuna",age:22})

// function getUserName({name,age}: {name:string; age:number}):string | number{
//    return userDetail.name
// }

// getUserName({name:"midhuna",age:22})


