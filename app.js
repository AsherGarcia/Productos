const express = require("express");
const mysql = require("mysql2");
const app = require("express")();
const bodyParser = require("body-parser");
const puerto = 9090;


let conection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mishi2006",
    database: "crudproductos"
});
conection.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}
))

app.use(express.static("public"));

app.use("/ingresarProducto", async (req, res)=> {
    try{
        let nombre = req.body.nombre;
        let cantidad = req.body.cantidad;
        let precio = req.body.precio;
        let marca = req.body.marca;
        let peso = req.body.peso;
        console.log(nombre)
        let id = 1;
            
        const response = await new Promise((resolve, reject)=>{
            conection.query("SELECT pro_id FROM productos ORDER BY(pro_id) ASC;", (error, response, fields)=>{
                if(error){
                    reject(error);
                }
                else{
                    resolve(response);
                }
            });
        });
        
        for(let i = 0; i < response.length; i++){
            let columna = response[i];
            if(columna.pro_id !== id){
                break;
            }
            
            id ++;
        }

        const insert = await new Promise((resolve, reject)=>{
            conection.query("INSERT INTO productos VALUES("+id+", '"+nombre+"', "+cantidad+", '"+precio+"','"+peso+"','"+marca+"');", (error, response, fields)=>
            {
                if(error){
                    console.log(error);
                    reject(false);
                }
                else{
                    resolve(true);
                }
            });
        });

        res.redirect("index.html");
    }
    catch(err){
        console.log(err)
    }
});

app.use("/mostrarProductos", async (request, response)=>{
    let trs = "";
    const productos = await new Promise((resolve, reject)=>{
        conection.query("SELECT pro_id, pro_nom, pro_prec,pro_can, pro_mar, pro_peso FROM productos;", (error, response, fields)=>{
            if(error){
                reject(error);
            }
            else{
                resolve(response);
            }
        });
    });

    for(let i = 0; i < productos.length; i++){
       
        trs += "<tr>";
        trs += "<td>"+productos[i].pro_id+"</td>";
        trs += "<td>"+productos[i].pro_nom+"</td>";
        trs += "<td>"+productos[i].pro_prec+"</td>";
        trs += "<td>"+productos[i].pro_can+"</td>";
        trs += "<td>"+productos[i].pro_mar+"</td>";
        trs += "<td>"+productos[i].pro_peso+"</td>";
        trs += "<td class='tdacciones'><form action='/accionesProducto' method='POST'><input type='hidden' name='id' value='"+productos[i].pro_id+"'><input type='submit' name='accion' class='btn-eliminar' value= 'Borrar'><input type='submit' name='accion' class='btn-editar' value='Editar'></form></td>";
        trs += "</tr>";
        

    }

    response.send("<html lang='es'><head><link rel='stylesheet' href='styles.css'></head><body class='body-tab'><table class='table'><tr><td class='tdencabezado'>Id</td><td class='tdencabezado'>Nombre</td><td class='tdencabezado'>Precio</td><td class='tdencabezado'>Cantidad</td><td class='tdencabezado'>Marca</td><td class='tdencabezado'>Peso</td><td class='tdencabezado'>¿Qué deseas realizar?</td></tr>"+trs+"</table><form action='index.html'><input type='submit' class='btn-regresar' value='Regresar'></form></body></html>");
});

app.use("/accionesProducto", async (request, response)=>{
    let trs = "";
    let valor = await new Promise((resolve, reject)=>{
        if(request.body.accion === "Borrar"){
            conection.query("DELETE FROM productos WHERE pro_id = "+request.body.id+";", (error, response, fields)=>{
                if(error){
                    console.log(error);
                    reject({});
                }
                else{
                    resolve({});
                }
            });
        }
        else{
            conection.query("SELECT pro_id, pro_nom, pro_can, pro_prec, pro_peso, pro_mar FROM productos WHERE pro_id = "+request.body.id+";", (error, response, fields)=>{
                if(error){
                    console.log(error);
                    reject({});
                }
                else{
                    resolve(response);
                }
            });


        }
    });

    if(valor.length !== 0){
        try{
            let formulario = "";
            let datos = valor[0];
            formulario += "<head><link rel='stylesheet' href='styles.css'></head>";

            formulario += "<form action='/actualizarProducto' method='POST'>";
            formulario += "<input type='hidden' name='id' value='"+datos.pro_id+"'>";
            formulario += "Nombre del Producto: <input type='text' class='input' name='nombre' value='"+datos.pro_nom+"'>";
            formulario += "<br>";
            formulario += "<label>Precio del Producto:</label> <input type='number' class='input' name='precio' value='"+datos.pro_prec+"' step='0.1'>";
            formulario += "<br>";
            formulario += "Cantidad del Producto: <input type='number' class='input' name='cantidad' value='"+datos.pro_can+"'>";
            formulario += "<br>";
            formulario += "Marca del Producto: <input type='number' class='input' name='marca' value='"+datos.pro_mar+"'>";
            formulario += "<br>";
            formulario += "Peso del Producto: <input type='number' class='input' name='peso' value='"+datos.pro_peso+"'>";
            formulario += "<br>";
            formulario += "<input type='submit' class='submit' name='accion' value='Actualizar'>";

            formulario += "<form action='index.html'><input type='submit' class='btn-regresar' value='Regresar'></form>";
            formulario += "</form>";

            response.send("<html lang='es'><head><style>.input{background-color: #7ADBE5;color: black;border-radius: 6px;} .submit{background-color: #48FFD8;border-radius: 6px;} body{background-color: #5FA2D4;}</style></head><body>"+formulario+"</body></html>");
        }
        catch(err){
            response.redirect("/mostrarProductos")
        }
    }
    else{
        response.redirect("/mostrarProductos");
    }
});

app.post("/actualizarProducto", async (request, response)=>{
    let respuesta = await new Promise((resolve, reject)=>{
        try{
            conection.query("UPDATE productos SET pro_nom = '"+request.body.nombre+"', pro_prec = '"+request.body.precio+"', pro_can = "+request.body.cantidad+", pro_peso = '"+request.body.peso+"', pro_mar = '"+request.body.marca+"';", (error, response, fields)=>{
                if(error){
                    reject(false);
                }
                else{
                    resolve(true);
                }
            });
        }
        catch(err){

        }
    });

    if(respuesta){
        response.redirect("/mostrarProductos");
    }
});

app.listen(puerto,() =>{
    console.log("Escuchando en: http://localhost:"+ puerto+"/");
    
});



