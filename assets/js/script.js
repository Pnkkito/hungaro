var params = {
	size : 0,
	operation: 1,
	auto: 1,
	matriz_default: [],
	matriz_input: [],
	matriz_maximo: [],
	messaje : '',
	hist_rows : [],
	hist_cols : [], 
	has_default: false,
	default_values : [
						[15, 19, 20, 18],
						[14, 15, 17, 14],
						[11, 15, 15, 14],
						[21, 24, 26, 24]
					]
};

var hungaro = { 
	/*Buttons*/
	generate_button: null,
	calcular_button: null,

	/*Tables*/
	table_matriz: null,

	/*Setters*/
	setGenerateButton : function(obj) {

		var $this = this;

		this.generate_button = $(obj) ;	
		this.generate_button.on('click', function(){

			$this.init_values();

			try { 
				if (!/^[0-9]+$/.test(params.size)) throw "Tamaño de matriz solo numero";
				if (params.size <= 0) throw "Tamaño de matriz debe ser mayor a cero";

				$this.init_table_matriz();
		    } catch(err) {
		    	alert(err); 
		    }
		});
	},
	setCalculateButton : function(obj) {

		var $this = this;

		this.calcular_button = $(obj) ;	
		this.calcular_button.on('click', function(){

			params.messaje = '';

			$this.init_calc_matriz();

			$('#div_process').html(params.messaje).removeClass('hidden'); 
		});
	},
	setTableMatriz : function(obj) {
		this.table_matriz = $(obj) ;	
	},

	/*Init*/
	init_values : function() {
		params.size = $('input[name="txt_matriz_size"]').val();
		params.operation = $('select[name="slc_operation"]').val();	
		params.auto = $('select[name="slc_auto"]').val();
	},
	init_table_matriz: function() { 

		// Limpia el contenido de la tabla
		this.table_matriz.html('');

		/**/
		for (var i = 0; i < params.size; i++) {
			var matriz_item = {};
			var $tr = generate.tr(null);

			for (var f = 0; f < params.size; f++) {
				// Valor del campo a evaluar
				matriz_item[f] = (params.auto == 1? generate.random(): null);

				if (params.has_default == true) {
					matriz_item[f] = params.default_values[i][f];					
				}

				var $td = generate.td(null);
				var $input = generate.input({
												val: matriz_item[f],
												name: 'F'+i+'_C'+f
											});	

				$td.append($input);
				$tr.append($td);	
			}

			this.table_matriz.append($tr);
			params.matriz_default.push(matriz_item);
		}; 	

		params.matriz_input 	= params.matriz_default.slice(0);	
		params.matriz_maximo 	= params.matriz_default.slice(0);	

		this.calcular_button.removeClass('hidden');
	},
	init_calc_matriz: function() {

		this.init_values();

		/*Original*/
		for (var i = 0; i < params.size; i++) {
			for (var f = 0; f < params.size; f++) {
				var input_val = $('input[name="F'+i+'_C'+f+'"]').val();

				if (params.matriz_default[i][f] != input_val) {
					params.matriz_default[i][f] = input_val;	
				}
			}	
		}

		/*Verifica cambios en las entradas de datos*/
		params.matriz_input 	= params.matriz_default.slice(0);
		params.matriz_maximo 	= params.matriz_default.slice(0);

		/*Verifica si se require maximizar*/
		if (params.operation == 0) {
			var maxim_arr = [];
			var maxim_obj = {};

			for (var i = 0; i < params.size; i++) {
				for (var f = 0; f < params.size; f++) {
					maxim_arr.push(params.matriz_default[i][f]);
				}	
			}

			for (var i = 0; i < maxim_arr.length; i++) {
				maxim_obj[i] = maxim_arr[i];
			};

			var maxim_obj_order = this.getMaxNum(maxim_obj);
			var maxim_num_mayor = maxim_obj_order[0];

			for (var i = 0; i < params.size; i++) {
				for (var f = 0; f < params.size; f++) {
					params.matriz_default[i][f] = (params.matriz_default[i][f] - maxim_num_mayor);
					params.matriz_default[i][f] = ( params.matriz_default[i][f] >= 0? params.matriz_default[i][f]: (params.matriz_default[i][f] * -1))
				}	
			} 

			params.matriz_input 	= params.matriz_default;
			params.matriz_maximo 	= params.matriz_default; 

			this.addText('* Para maximizar se resta los numeros de la matriz con el mayor numero'); 
		}
		
		/*Recorre valores de matriz*/
		for (var i = 0; i < params.size; i++) {
			// Obtiene el valor de array ordenado 
			var item_arr 	= this.getMinNum(params.matriz_input[i]);
			// Obtiene el numero menor del array ordenado
			var num_menor	= item_arr[0];

			// Recorre y actualiza los valores del arreglo en el parametro "matriz_input"
			for (var f = 0; f < params.size; f++) { 
				params.matriz_input[i][f] = (params.matriz_input[i][f] - num_menor);
			} 
		};

		this.addText('* Resta fila numero menor'); 

		for (var i = 0; i < params.size; i++) {
			// Verifica si alguna columna no contiene ceros
			var cero_count = 0; 
				
			for (var f = 0; f < params.size; f++) {  
				if (params.matriz_input[f][i] == 0) {
					cero_count++;
				}
			}

			if (cero_count == 0) {
				var item_col_arr = {};

				for (var f = 0; f < params.size; f++) {  
					item_col_arr[f] = params.matriz_input[f][i];	
				}

				// Obtiene el valor de array ordenado 
				var item_arr 	= this.getMinNum(item_col_arr);
				// Obtiene el numero menor del array ordenado
				var num_menor	= item_arr[0];

				for (var f = 0; f < params.size; f++) {  
					params.matriz_input[f][i] = (params.matriz_input[f][i] - num_menor);	
				}
			}
		};

		this.addText('* Resta columna numero menor'); 

		this.lines();
		this.final_value();
	},
	lines : function() { 

		/*Busca lineas horizontales*/
		for (var i = 0; i < params.size; i++) {
			var row_cero 	= 0;
			var last_column	= 0;

			for (var f = 0; f < params.size; f++) {
				if (params.matriz_input[i][f] == 0 && params.hist_cols.indexOf(f) == -1) {
					last_column = f;
					row_cero++;
				}
			};

			if (row_cero > 1 && params.hist_rows.indexOf(i) == -1) { 
				params.hist_rows.push(i);
			}

			if (row_cero == 1 && params.hist_cols.indexOf(last_column) == -1 && params.hist_rows.indexOf(i) == -1) {
				params.hist_cols.push(last_column);
			}
		};

		var line_num = ( params.hist_rows.length + params.hist_cols.length);

		/*Busca lineas verticales*/
		if (line_num < params.size) {

			/*Obtenemos todos los numeros que no se encuentran en las lineas*/
			var num_out_line = [];
			var out_line_obj = {}; 

			for (var i = 0; i < params.size; i++) {
				for (var f = 0; f < params.size; f++) {
					if (
						params.hist_rows.indexOf(i) == -1 && params.hist_cols.indexOf(f) == -1 || 
						params.hist_rows.indexOf(i) > -1 && params.hist_cols.indexOf(f) == -1 && params.matriz_input[i][f] > 0
						) 
					{ 
						num_out_line.push(params.matriz_input[i][f]);
					}
				}
			}

			for (var i = 0; i < num_out_line.length; i++) {
				out_line_obj[i] = num_out_line[i];
			};	

			var num_out_obj 	= this.getMinNum(out_line_obj);
			var num_out_filter 	= num_out_obj.filter(function(ele){return ele > 0;});
			var num_menor 		= num_out_filter[0];

 			//Obtenemos los cruses de lineas y le sumanos una cantidad
 			for (var i = 0; i < params.size; i++) {
				for (var f = 0; f < params.size; f++) {
					if (params.hist_rows.indexOf(i) > -1 && params.hist_cols.indexOf(f) > -1 ) { 
					//if (row_line_busy.indexOf(i) > -1 && col_line_busy.indexOf(f) > -1 && i == f) { 
					/*if (params.hist_rows.indexOf(i) > -1 && params.hist_cols.indexOf(f) > -1 && 
						( params.hist_rows.indexOf(i) == params.hist_cols.indexOf(f) || i == f)
						) { */
						params.matriz_input[i][f] = ( params.matriz_input[i][f] + 1);
					}
				}
			}

			//Restamos el numero menor a los numeros que no se encuentran en las lineas
			for (var i = 0; i < params.size; i++) {
				for (var f = 0; f < params.size; f++) {
					if (
						params.hist_rows.indexOf(i) == -1 && params.hist_cols.indexOf(f) == -1 ||
						params.hist_rows.indexOf(i) > -1 && params.hist_cols.indexOf(f) == -1 && params.matriz_input[i][f] > 0
					) { 
						params.matriz_input[i][f] = (params.matriz_input[i][f] > 0 ? 
														(params.matriz_input[i][f] - num_menor): params.matriz_input[i][f]); 
					}
				}
			} 

			this.addText('* Obtiene el numero menor entre los numeros que no se encuentren en sl cruse de las lineas y los resta con los mismo');

			this.lines();
		}


	},
	final_value : function() {

		var tached_rows = [];
		var tached_cols = [];

		console.log(params.matriz_input[0]);
		console.log(params.matriz_input[1]);
		console.log(params.matriz_input[2]);
		console.log(params.matriz_input[3]);

		/*Buscamos las columnas que tengan un solo valor de cero*/
		for (var i = 0; i < params.size; i++) {

			var cero_count 	= 0;
			var last_column = 0;

			for (var f = 0; f < params.size; f++) {
				if (params.matriz_input[f][i] == 0) {
					last_column = f;
					cero_count++;
				}
			}	

			if (cero_count == 1) {
				tached_rows.push(last_column);
				tached_cols.push(i);
			}
		}

		if (tached_rows.length < params.size) {
			for (var i = params.size - 1; i >= 0; i--) {
				var cero_count 	= 0;
				var last_column = 0;

				for (var f = 0; f < params.size; f++) {
					if (params.matriz_input[f][i] == 0 && tached_rows.indexOf(f) == -1) {
						last_column = f;
						cero_count++; 
					}
				}

				if (cero_count == 1) { 
					tached_cols.push(i);
					tached_rows.push(last_column); 
				}
			}; 	
		}

		/*Especial*/
		for (var i = 0; i < params.size; i++) {

			var cero_count 	= 0;
			var last_column = 0;

			for (var f = 0; f < params.size; f++) {
				if (params.matriz_input[f][i] == 0) {
					last_column = f;
					cero_count++;
				}
			}	

			if (cero_count == 1) {
				tached_rows.push(last_column);
				tached_cols.push(i);
			}
		}
		if (tached_rows.length < params.size) {
			for (var i = params.size - 1; i >= 0; i--) {
				var cero_count 	= 0;
				var last_column = 0;

				for (var f = 0; f < params.size; f++) {
					if (params.matriz_input[f][i] == 0 && tached_rows.indexOf(f) == -1) {
						last_column = f;
						cero_count++; 
					}
				}

				if (cero_count == 1) { 
					tached_cols.push(i);
					tached_rows.push(last_column); 
				}
			}; 	
		}

		console.log(tached_rows);
		console.log(tached_cols);

		var z_arr_values 	= [];
		var z_value 		= 0; 

		for (var i = 0; i < params.size; i++) {
			z_arr_values.push( $('input[name="F'+tached_rows[ i ]+'_C'+tached_cols[ i ]+'"]').val() );	
			//z_arr_values.push( params.matriz_default[ tached_rows[ i ] ][ tached_cols[ i ] ] );	
		}

		for (var i = 0; i < z_arr_values.length; i++) {
			z_value +=  parseInt(z_arr_values[i]);
		}; 

		$('#z_result').text(z_value);
		$('#z_content').removeClass('hidden'); 
	},
	getMinNum : function(obj) {
		return this.objToArray(obj).sort(function(a, b){return a-b}); 
	},
	getMaxNum : function(obj) {
		return this.objToArray(obj).sort(function(a, b){return b-a});
	},
	objToArray : function(obj) {
		var obj_copy = obj;
		var obj_arr  = [];

		if (Object.keys(obj).length > 0) {
			for (indice in obj_copy) {
				obj_arr.push(obj_copy[indice]);
			};
		} 

		return obj_arr;
	},
	addText : function(messaje) {
		
		params.messaje += '<br>' + messaje + '<br>';

		params.messaje += '<table class="table table-bordered">';

		for (var i = 0; i < params.size; i++) {
			params.messaje += '<tr>';

				var contador = 0;

				for (var f = 0; f < params.size; f++) {
					params.messaje += '<td>'+params.matriz_input[i][f] + (contador == params.size ? '': '')+'</td>';	

					contador++;
				}

			params.messaje += '<t>';
		};

		params.messaje += '</table>';
	}
};

var generate = { 
	tr : function (opts) {
		return $('<tr>').attr({class: null, id: null});
	},
	td : function(opts) {
		return $('<td>').attr({class: null, id: null});
	},
	input: function(opts) {

		var val = (opts != null && 'val' in opts ? opts.val: null);
		var name = (opts != null && 'name' in opts ? opts.name: null);

		return $('<input>').attr({
							name: name,
							value: val,
							id: null,	
							class: 'form-control input-sm',
							placeholder: '0'
						});
	},
	random: function() {
		return Math.floor((Math.random() * 20) + 1);
	}
};

;(function($){
	
	hungaro.setTableMatriz('#table_matriz');
	hungaro.setGenerateButton('#btn_generar');
	hungaro.setCalculateButton('#btn_calcular');
		
})(jQuery);