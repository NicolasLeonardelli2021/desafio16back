

function random(cant){
    let numAleatorios = [];
    let objNum = new Object();
    
    
    for(let i = 0; i< cant; i++ ){
    numAleatorios[i]= (Math.floor(Math.random()* (1001)))
    }
    
    for(let i=0; i<=1000; i++){
        let contador = 0;
        for(let j=0;j<numAleatorios.length;j++){
            if(numAleatorios[j]==i){
                contador++;
            }
        }
        const clave = i.toString();
        objNum[`${clave}`] = contador; 
        }
        return objNum
}

process.on('message', data=>{
    console.log("[CHILD] -->", {data});
    process.send(random(data))
})