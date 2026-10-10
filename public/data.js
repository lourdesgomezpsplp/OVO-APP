"use strict";
/* =====================================================================
   DATOS DE LOS INSTRUMENTOS
   Ítems, claves de corrección y baremos transcriptos de los PDF cargados.
   ===================================================================== */

const CIP_TXT = [
"Aprender estilos de pintura artística.","Cantar en coros.","Trabajar en estudios jurídicos.","Trabajar con calculadoras.","Aprender decoración.",
"Estudiar derecho constitucional.","Planificar la construcción de obras fluviales y marítimas.","Estudiar los ecosistemas de una región.","Aprender a interpretar radiografías.","Hacer esculturas.",
"Supervisar obras en construcción.","Organizar la producción en una industria química.","Investigar el nivel de los precios.","Evaluar daños de edificios y viviendas.","Aprender a realizar pronósticos meteorológicos.",
"Construir puentes.","Resolver ecuaciones matemáticas.","Trabajar con equipos electrónicos.","Elaborar una crítica de una obra artística teatral o cinematográfica.","Reparar electrodomésticos.",
"Asesorar a estudiantes sobre técnicas de aprendizaje.","Analizar audiencias o juicios.","Evaluar el estado de conexiones eléctricas.","Aprender a utilizar instrumental médico.","Colaborar en un periódico o revista escolar.",
"Enseñar matemática.","Asesorar en empresas constructoras.","Analizar obras literarias.","Investigar las propiedades de diversos metales.","Aprender a realizar análisis bioquímicos.",
"Conocer técnicas y materiales de dibujo artístico.","Leer biografías de personas famosas.","Investigar sobre mitología.","Investigar las causas de las enfermedades.","Aprender a tomar fotografías periodísticas.",
"Analizar textos históricos.","Investigar centros y movimientos sísmicos.","Enseñar a niños.","Asesorar sobre cuidado de plantas.","Aprender anatomía.",
"Analizar el proceso de formación de las nubes.","Tomar declaraciones a testigos de un hecho delictivo.","Traducir documentos comerciales a otro idioma.","Realizar análisis químicos de productos industriales.","Investigar la constitución físico-química de los minerales.",
"Enseñar a dibujar o pintar.","Enseñar idiomas extranjeros.","Hacer experimentos para desarrollar nuevas variedades de vegetales.","Trabajar en centros médicos.","Musicalizar obras teatrales.",
"Hacer artesanías.","Reconocer los diferentes instrumentos de una orquesta.","Trabajar en un archivo histórico.","Investigar las causas de la deserción escolar.","Analizar problemas económicos internacionales.",
"Investigar los factores que influyen sobre la producción agropecuaria.","Tocar un instrumento musical.","Asesorar a personas en juicios de divorcio.","Traducir artículos científicos a otro idioma.","Asesorar sobre impuestos.",
"Supervisar las condiciones laborales de una empresa.","Hacer cálculos numéricos.","Producir programas televisivos.","Controlar los planos de una obra en construcción.","Enseñar literatura.",
"Aprender un idioma extranjero.","Investigar acontecimientos históricos.","Asesorar a personas con inquietudes literarias.","Trabajar con elementos de geometría.","Leer partituras.",
"Concurrir a conciertos musicales.","Aprender a elaborar dietas para pacientes.","Aprender a elaborar guiones para obras audiovisuales.","Diseñar unidades ópticas de automóviles.","Asesorar sobre cría de animales.",
"Hacer notas para una radio.","Aprender técnicas de dirección orquestal.","Realizar arreglos musicales.","Organizar las relaciones públicas de una empresa.","Analizar temas de comercio internacional.",
"Aprender álgebra.","Asesorar sobre métodos de cultivo de plantas alimenticias.","Redactar anuncios publicitarios.","Trabajar en ambientes rurales.","Investigar el movimiento de los átomos.",
"Investigar el empleo de la energía nuclear.","Armar y probar motores.","Investigar acerca de especies frutícolas.","Diseñar vehículos de gran tamaño.","Ayudar a personas con problemas emocionales.",
"Diseñar obras de arquitectura.","Enseñar a adultos.","Leer obras literarias en otro idioma.","Cuidar pacientes.","Hacer pintura mural.",
"Trabajar con telescopios.","Enseñar a personas con discapacidades.","Ayudar a personas con problemas laborales.","Investigar el origen y evolución del sistema solar.","Organizar empresas.",
"Programar computadoras.","Trabajar en cerámica.","Comprender conversaciones en otro idioma.","Trabajar en un laboratorio de física.","Defender a personas acusadas en un juicio.",
"Componer música.","Estudiar planes de desarrollo económico.","Organizar actividades recreativas para ancianos.","Investigar la atmósfera de otros planetas.","Planificar actividades administrativas en empresas.",
"Investigar problemas matemáticos.","Analizar la situación financiera de una empresa.","Filmar películas documentales.","Armar circuitos eléctricos."
];

const IAMI_TXT = [
"Analizar obras literarias (novelas, por ejemplo).","Crear composiciones literarias (cuento o poesía, por ejemplo).","Reconocer géneros y estilos literarios (poesía modernista, por ejemplo).","Extraer las ideas principales de un texto.","Redactar con corrección gramatical (uso apropiado de los tiempos verbales, por ejemplo).","Escribir textos periodísticos sobre temas de actualidad (colaborando en una publicación escolar, por ejemplo).","Redactar monografías (sobre historia contemporánea, por ejemplo).","Expresarse con un vocabulario amplio y fluido.",
"Resolver problemas de la Física (velocidad de desplazamiento de la luz o el sonido, por ejemplo).","Obtener notas altas en Matemática.","Interpretar estadísticas de encuestas o censos (índices de mortalidad o natalidad, por ejemplo).","Resolver problemas geométricos (superficies, por ejemplo).","Realizar mentalmente operaciones matemáticas (porcentajes, por ejemplo).","Resolver ecuaciones de la Química.","Resolver problemas de cálculo (consumo de combustible por kilómetro recorrido, por ejemplo).","Utilizar calculadoras científicas.","Realizar tareas de contabilidad (cálculo de sueldos complementarios, por ejemplo).",
"Dibujar motivos con precisión (una persona, por ejemplo).","Dibujar objetos en tres dimensiones (figuras geométricas, por ejemplo).","Emplear la perspectiva en el dibujo (representación de paisajes, por ejemplo).","Interpretar planos (de una vivienda, por ejemplo).","Diseñar construcciones (con juegos de armar, por ejemplo).","Diseñar maquetas (de aviones, por ejemplo).","Realizar diseño gráfico (tarjetas o afiches, por ejemplo).","Hacer planos (de maquinaria, por ejemplo).",
"Ejecutar un instrumento musical como solista.","Leer partituras musicales.","Componer música.","Cantar en armonía junto a otras personas (coros, por ejemplo).","Cantar como solista entonadamente (sin desafinar).","Evaluar la afinación de un instrumento musical.","Ejecutar un instrumento en un grupo musical.","Escuchar una melodía sencilla y transcribirla en una partitura.","Realizar variaciones o arreglos de un tema musical.",
"Aconsejar a conocidos con problemas personales.","Reconocer rápidamente los deseos e intenciones de otras personas.","Conducir un grupo de personas.","Exponer un tema en público (un debate o una clase, por ejemplo).","Actuar en representaciones dramáticas (obra teatral, por ejemplo).","Defender los derechos de otras personas (compañeros de colegio, por ejemplo).","Entrevistarse con personas de mayor jerarquía (directivos escolares, por ejemplo).","Promocionar un producto o servicio.","Iniciar y mantener relaciones con desconocidos.",
"Practicar algún deporte de esfuerzo prolongado (ciclismo o natación, por ejemplo).","Realizar ejercicios físicos de precisión (encestar en un aro, por ejemplo).","Realizar carreras de velocidad.","Realizar ejercicios físicos de resistencia (abdominales, por ejemplo).","Realizar ejercicios físicos de agilidad (saltar en largo, por ejemplo).","Esquivar obstáculos en carrera.","Hacer ejercicios físicos de coordinación individual (media luna, por ejemplo).","Hacer ejercicios físicos de equilibrio (caminar sobre barras, por ejemplo).","Realizar ejercicios de fuerza (trepar una soga, por ejemplo).",
"Comprender tu personalidad (las causas de tus reacciones más características).","Describir con precisión tus sentimientos (mediante un diario personal, por ejemplo).","Identificar tus necesidades emocionales (de afecto, por ejemplo).","Describir tus aspiraciones y metas (cómo te ves en el futuro, por ejemplo).","Analizar las causas de tus emociones (situaciones que te generan temor, por ejemplo).","Conocer tus fortalezas y debilidades en diversas situaciones (capacidades, por ejemplo).","Reconocer tus emociones en el momento que ocurren (ira, por ejemplo).","Distinguir tus sentimientos relacionados o semejantes (tristeza momentánea y depresión, por ejemplo).",
"Reconocer tipos de células y/o tejidos en el microscopio (epidérmicos, por ejemplo).","Reconocer diferentes tipos de rocas (granitos, por ejemplo).","Identificar diferencias entre animales de un mismo orden (víboras venenosas e inofensivas, por ejemplo).","Identificar vegetales de una misma familia (diferentes árboles leñosos, por ejemplo).","Usar técnicas de evaluación de la contaminación ambiental (del aire o agua, por ejemplo).","Hacer experimentos para analizar fenómenos naturales (proceso de fotosíntesis, por ejemplo).","Identificar distintos tipos de suelos (arcillosos, por ejemplo).","Identificar tipos de cuerpos celestes (diferentes constelaciones con telescopio, por ejemplo).","Emplear técnicas de evaluación del clima (registro de la velocidad del viento, por ejemplo)."
];

const HOL_TXT = [
"Es importante para mí tener un cuerpo fuerte y ágil.","Necesito tener una comprensión completa de las cosas.","La música, el color, la belleza de cualquier clase pueden realmente afectar mi manera de ser.","La gente enriquece mi vida y le da sentido.","Tengo confianza en mí mismo/a como para poder hacer las cosas.","Me interesa tener claras las pautas para saber qué hacer.",
"Usualmente puedo construir o sostener cosas sólidas por mí mismo.","Puedo estar absorto por horas en mis pensamientos.","Aprecio la belleza a mi alrededor, el color y el diseño significan mucho para mí.","Me gusta estar acompañado.","Me gusta la competencia.","Necesito tener mi entorno en orden antes de iniciar un proyecto.",
"Disfruto haciendo manualidades.","Es gratificante explorar nuevas ideas.","Siempre estoy buscando nuevas formas para expresar mi creatividad.","Valoro la capacidad de compartir cosas personales con los demás.","Me gusta ser una persona clave del grupo.","Me enorgullece ser cuidadoso en todos los detalles de mi trabajo.",
"No me molesta ensuciarme las manos.","Veo a la educación como un proceso que se da a lo largo de la vida, que desarrolla y marca mi mente.","Me encanta vestirme de manera informal, intentar nuevos colores y estilos.","Casi siempre me doy cuenta cuando alguien necesita hablar.","Me alegra encontrar gente organizada y en acción.","Una buena rutina ayuda a hacer el trabajo.",
"Me gusta comprar materiales para hacer las cosas por mí mismo.","A veces puedo estar sentado por largo tiempo armando rompecabezas o leyendo o sólo pensando acerca de la vida.","Tengo una gran imaginación.","Me hace sentir bien cuidar a la gente.","Me gusta que me tengan confianza para hacer un trabajo.","Estoy satisfecho sabiendo que hice un trabajo cuidadosa y completamente.",
"Me gusta hacer cosas prácticas, manuales.","Me meto de lleno a leer sobre temas que despiertan mi curiosidad.","Me gusta aplicar creativamente nuevas ideas.","Si tengo un problema con alguien me gusta hablar y resolverlo.","Para tener éxito hay que apuntar alto.","Prefiero estar en una posición en la que no tenga responsabilidad en las decisiones.",
"No me gusta perder mucho tiempo en discusiones: lo que es así es así.","Necesito analizar profundamente un problema antes de actuar.","Me gusta arreglar las cosas a mi alrededor para que parezcan únicas y diferentes.","Cuando me siento deprimido, busco a un amigo para hablar.","Después de sugerir un plan, prefiero dejarle a los otros la atención de los detalles.","En general, me siento cómodo/a en cualquier parte.",
"Es estimulante realizar actividades al aire libre.","Sigo preguntando ¿Por qué?","Deseo que mi trabajo sea una expresión de mi manera de ser y de mis sentimientos.","Me gustaría encontrar medios para hacer que la gente se interese más en el prójimo.","Es emocionante ser parte de decisiones importantes.","Me gusta que haya alguien más que se ocupe.",
"Me gusta que lo que me rodea sea comprensible y práctico.","Necesito meterme en el problema hasta encontrar una respuesta.","La belleza de la naturaleza toca algo muy profundo dentro de mí.","Las relaciones familiares son muy importantes para mí.","Ascender y progresar es importante para mí.","La eficiencia para mí significa armar a diario el conjunto de manera cuidadosa y ordenada.",
"Un sistema de leyes fuertes y el orden son importantes para prevenir el caos.","Los libros que desafían la manera de pensar siempre amplían mi perspectiva.","Busco ir a espectáculos artísticos, musicales y ver buenas películas.","Cuando paso un tiempo sin ver a alguien quisiera saber en qué está.","Influir en la gente es algo atractivo.","Cuando me comprometo a hacer algo tengo en cuenta cada detalle.",
"Y bien, el trabajo físico duro no le hace mal a nadie.","Me gustaría aprender todo sobre los temas que me interesan.","No me gusta ser del montón, quiero hacer las cosas de manera diferente.","Dime cómo te puedo ayudar.","Estoy dispuesto/a a asumir riesgos para seguir adelante.","Quiero instrucciones precisas y reglas claras cuando comienzo algo.",
"Lo primero que busco en un auto es un motor bien construido.","Algunas personas son intelectualmente estimulantes.","Cuando estoy creando no presto atención a otras cosas.","Estoy convencido de que mucha gente en nuestra sociedad necesita ayuda.","Es divertido obtener ideas a través de la gente.","Odio que cambien los esquemas cuando ya los aprendí.",
"Usualmente sé cómo actuar en situaciones de emergencia.","Es atrapante leer sobre nuevos descubrimientos.","Me gusta crear situaciones fuera de lo común.","Con frecuencia dejo mis cosas para prestar atención a la gente que parece solitaria y sin amigos.","Me encanta el intercambio.","No me gusta hacer cosas de las que no estoy seguro de su consistencia.",
"Los deportes son importantes para alcanzar la fortaleza física.","Siempre he tenido curiosidad acerca de la modalidad de los trabajos al aire libre.","Es divertido tener condiciones para tratar o hacer algo inusual.","Creo que la gente es básicamente buena.","Si no puedo hacer algo en el primer intento, trato otra vez con entusiasmo y energía.","Aprecio saber exactamente qué es lo que la gente espera de mí.",
"Me gusta poner distancia en las cosas para ver si puedo asegurarlas.","No hay que apurarse, se pueden pensar y planificar los movimientos lógicamente.","Sería duro imaginar la vida sin belleza alrededor.","A menudo la gente me confía sus problemas.","En general, me acerco a la gente que me pone en contacto con distintos recursos.","No necesito demasiado para ser feliz."
];
Const CHA_TXT = [
“¿Aceptarías trabajar escribiendo artículos en la sección económica de un diario?”,”¿Te ofrecerías para organizar la despedida de soltero de uno de tus amigos?”,”¿Te gustaría dirigir un proyecto de urbanización en tu provincia?”,”¿A una frustración siempre opones un pensamiento positivo?”,”¿Te dedicarías a socorrer a personas accidentadas o atacadas por asaltantes?”,
“¿Cuándo eras chico, te interesaba saber cómo estaban construidos tus juguetes?”,”¿Te interesan más los misterios de la naturaleza que los secretos de la tecnología?”,”¿Escuchás atentamente los problemas que te plantean tus amigos?”,”¿Te ofrecerías para explicar a tus compañeros un determinado tema que ellos no entendieron?”,”¿Sos exigente y crítico con tu equipo de trabajo?”,
“¿Te atrae armar rompecabezas o puzzles?”,”¿Podés establecer la diferencia conceptual entre macroeconomía y microeconomía?”,”¿Usar uniforme te hace sentir distinto, importante?”,”¿Participarías como profesional en un espectáculo de acrobacia aérea?”,”¿Organizás tu dinero de manera que te alcance hasta el próximo cobro?”,
“¿Convencés fácilmente a otras personas sobre la validez de tus argumentos?”,”¿Estás informado sobre los nuevos descubrimientos que se están realizando sobre la Teoría del Big-Bang?”,”¿Ante una situación de emergencia actuás rápidamente?”,”¿Cuándo tenés que resolver un problema matemático, perseverás hasta encontrar la solución?”,”¿Si te convocara tu club preferido para planificar, organizar y dirigir un campo de deportes, aceptarías?”,
“¿Sos el que pone un toque de alegría en las fiestas?”,”¿Creés que los detalles son tan importantes como el todo?”,”¿Te sentirías a gusto trabajando en un ámbito hospitalario?”,”¿Te gustaría participar para mantener el orden ante grandes desórdenes y cataclismos?”,”¿Pasarías varias horas leyendo algún libro de tu interés?”,
“¿Planificás detalladamente tus trabajos antes de empezar?”,”¿Entablás una relación casi personal con tu computadora?”,”¿Disfrutás modelando con arcilla?”,”¿Ayudás habitualmente a los no videntes a cruzar la calle?”,”¿Considerás importante que desde la escuela primaria se fomente la actitud crítica y la participación activa?”,
“¿Aceptarías que las mujeres formaran parte de las fuerzas armadas bajo las mismas normas que los hombres?”,”¿Te gustaría crear nuevas técnicas para descubrir las patologías de algunas enfermedades a través del microscopio?”,”¿Participarías en una campaña de prevención contra la enfermedad de Chagas?”,”¿Te interesan los temas relacionados al pasado y a la evolución del hombre?”,”¿Te incluirías en un proyecto de investigación de los movimientos sísmicos y sus consecuencias?”,
“¿Fuera de los horarios escolares, dedicás algún día de la semana a la realización de actividades corporales?”,”¿Te interesan las actividades de mucha acción y de reacción rápida en situaciones imprevistas y de peligro?”,”¿Te ofrecerías para colaborar como voluntario en los gabinetes espaciales de la NASA?”,”¿Te gusta más el trabajo manual que el trabajo intelectual?”,”¿Estarías dispuesto a renunciar a un momento placentero para ofrecer tu servicio como profesional?”,
“¿Participarías de una investigación sobre la violencia en el fútbol?”,”¿Te gustaría trabajar en un laboratorio mientras estudiás?”,”¿Arriesgarías tu vida para salvar la vida de otro que no conocés?”,”¿Te agradaría hacer un curso de primeros auxilios?”,”¿Tolerarías empezar tantas veces como fuere necesario hasta obtener el logro deseado?”,
“¿Distribuís tus horarios del día adecuadamente para poder hacer todo lo planeado?”,”¿Harías un curso para aprender a fabricar los instrumentos y/o piezas de las máquinas o aparatos con que trabajás?”,”¿Elegirías una profesión en la que tuvieras que estar algunos meses alejado de tu familia, por ejemplo el marino?”,”¿Te radicarías en una zona agrícola-ganadera para desarrollar tus actividades como profesional?”,”¿Cuándo estás en un grupo trabajando, te entusiasma producir ideas originales y que sean tenidas en cuenta?”,
“¿Te resulta fácil coordinar un grupo de trabajo?”,”¿Te resultó interesante el estudio de las ciencias biológicas?”,”¿Si una gran empresa solicita un profesional como gerente de comercialización, te sentirías a gusto desempeñando ese rol?”,”¿Te incluirías en un proyecto nacional de desarrollo de la principal fuente de recursos de tu provincia?”,”¿Tenés interés por saber cuáles son las causas que determinan ciertos fenómenos, aunque saberlo no altere tu vida?”,
“¿Descubriste algún filósofo o escritor que haya expresado tus mismas ideas con antelación?”,”¿Desearías que te regalen algún instrumento musical para tu cumpleaños?”,”¿Aceptarías colaborar con el cumplimiento de las normas en lugares públicos?”,”¿Creés que tus ideas son importantes, y hacés todo lo posible para ponerlas en práctica?”,”¿Cuándo se descompone un artefacto en tu casa, te disponés prontamente a repararlo?”,
“¿Formarías parte de un equipo de trabajo orientado a la preservación de la flora y la fauna en extinción?”,”¿Acostumbrás a leer revistas relacionadas con los últimos avances científicos y tecnológicos en el área de la salud?”,”¿Preservar las raíces culturales de nuestro país te parece importante y necesario?”,”¿Te gustaría realizar una investigación que contribuyera a hacer más justa la distribución de la riqueza?”,”¿Te gustaría realizar tareas auxiliares en una nave, como por ejemplo izado y arriado de velas, pintura y conservación del casco, arreglo de averías, conservación de motores, etc.?”,
“¿Creés que un país debe poseer la más alta tecnología armamentista, a cualquier precio?”,”¿La libertad y la justicia son valores fundamentales en tu vida?”,”¿Aceptarías hacer una práctica rentada en una industria de productos alimenticios en el sector de control de calidad?”,”¿Considerás que la salud pública debe ser prioritaria, gratuita y eficiente para todos?”,”¿Te interesaría investigar sobre alguna nueva vacuna?”,
“¿En un equipo de trabajo, preferís el rol de coordinador?”,”¿En una discusión entre amigos, te ofrecés como mediador?”,”¿Estás de acuerdo con la formación de un cuerpo de soldados profesionales?”,”¿Lucharías por una causa justa hasta las últimas consecuencias?”,”¿Te gustaría investigar científicamente sobre cultivos agrícolas?”,
“¿Harías un nuevo diseño de una prenda pasada de moda, ante una reunión imprevista?”,”¿Visitarías un observatorio astronómico para conocer en acción el funcionamiento de los aparatos?”,”¿Dirigirías el área de importación y exportación de una empresa?”,”¿Te inhibís al entrar a un lugar nuevo con gente desconocida?”,”¿Te gratificaría el trabajar con niños?”,
“¿Harías el diseño de un afiche para una campaña contra el sida?”,”¿Dirigirías un grupo de teatro independiente?”,”¿Enviarías tu currículum a una empresa automotriz que solicita gerente para su área de producción?”,”¿Participarías en un grupo de defensa internacional dentro de alguna fuerza armada?”,”¿Te costearías tus estudios trabajando en una auditoría?”,
“¿Sos de los que defendés causas perdidas?”,”¿Ante una emergencia epidémica participarías en una campaña brindando tu ayuda?”,”¿Sabrías responder qué significa ADN y ARN?”,”¿Elegirías una carrera cuyo instrumento de trabajo fuere la utilización de un idioma extranjero?”,”¿Trabajar con objetos te resulta más gratificante que trabajar con personas?”,
“¿Te resultaría gratificante ser asesor contable en una empresa reconocida?”,”¿Ante un llamado solidario, te ofrecerías para cuidar a un enfermo?”,”¿Te atrae investigar sobre los misterios del universo, por ejemplo los agujeros negros?”,”¿El trabajo individual te resulta más rápido y efectivo que el trabajo grupal?”,”¿Dedicarías parte de tu tiempo a ayudar a personas de zonas carenciadas?”,
“¿Cuándo elegís tu ropa o decorás un ambiente, tenés en cuenta la combinación de los colores, las telas o el estilo de los muebles?”,”¿Te gustaría trabajar como profesional dirigiendo la construcción de una empresa hidroeléctrica?”,”¿Sabés qué es el PBI?”
];
/* ---------- CIP-R: escalas, ítems y baremo (límite inferior del rango por percentil) ---------- */
Const CIP_PCTS = [99,95,90,80,75,70,60,50,40];
Const CIP_SCALES = [
 {k:’cal’,n:’Cálculo’,      items:[4,17,26,62,69,81,111],       lb:[24,23,22,21,20,18,14,13,12]},
 {k:’cie’,n:’Científica’,   items:[12,29,30,44,45,85,86,104],   lb:[24,23,22,21,20,19,18,15,13]},
 {k:’dis’,n:’Diseño’,       items:[7,11,14,16,27,64,91],        lb:[21,20,19,18,17,16,15,13,10]},
 {k:’tec’,n:’Tecnológica’,  items:[18,20,23,74,87,89,101,114],  lb:[24,23,22,21,20,19,17,15,13]},
 {k:’geo’,n:’Geoastronómica’,items:[15,37,41,96,99,109],        lb:[18,17,16,15,14,13,12,11,10]},
 {k:’nat’,n:’Naturalista’,  items:[8,39,48,56,75,82,84,88],     lb:[24,23,22,21,18,15,14,13,12]},
 {k:’san’,n:’Sanitaria’,    items:[9,24,34,40,49,72,94],        lb:[21,20,19,18,15,14,13,12,11]},
 {k:’asi’,n:’Asistencial’,  items:[21,38,54,90,92,97,108],      lb:[21,20,19,18,16,14,13,11,10]},
 {k:’jur’,n:’Jurídica’,     items:[3,6,22,42,58,61,98,105],     lb:[24,23,22,21,19,17,15,13,12]},
 {k:’eco’,n:’Económica’,    items:[13,55,60,80,100,107,110,112],lb:[24,23,22,21,19,17,15,14,12]},
 {k:’com’,n:’Comunicacional’,items:[19,25,35,63,73,76,79,83,113],lb:[27,26,25,22,21,19,17,14,13]},
 {k:’hum’,n:’Humanística’,  items:[28,32,33,36,53,65,67,68],    lb:[24,23,22,21,20,17,15,14,13]},
 {k:’art’,n:’Artística’,    items:[1,5,10,31,46,51,95,102],     lb:[24,23,22,21,20,17,15,14,13]},
 {k:’mus’,n:’Musical’,      items:[2,50,52,57,70,71,77,78,106], lb:[27,26,25,23,21,19,16,13,10]},
 {k:’lin’,n:’Lingüística’,  items:[43,47,59,66,93,103],         lb:[18,17,16,15,14,13,12,11,10]}
];
/* ---------- IAMI: escalas y baremo (límite inferior por percentil) ---------- */
Const IAMI_PCTS = [99,95,90,80,75,70,60,50,40,25,10,5,1];
Const IAMI_LB8 = [75,70,65,60,58,56,55,50,40,30,25,20,10];
Const IAMI_LB9 = [80,75,70,65,60,55,50,45,35,25,20,15,10];
Const IAMI_SC = [
 {k:’LIN’,n:’Lingüística’,from:1,to:8},
 {k:’LM’,n:’Lógico-matemática’,from:9,to:17},
 {k:’ESP’,n:’Espacial’,from:18,to:25},
 {k:’MUS’,n:’Musical’,from:26,to:34},
 {k:’INTER’,n:’Interpersonal’,from:35,to:43},
 {k:’CIN’,n:’Cinestésico-corporal’,from:44,to:52},
 {k:’INTRA’,n:’Intrapersonal’,from:53,to:60},
 {k:’NAT’,n:’Naturalista’,from:61,to:69}
];
/* ---------- Holland (RIASEC): el ítem n pertenece al tipo (n-1) mod 6 ---------- */
Const HOL_TYPES = [‘R’,’I’,’A’,’S’,’E’,’C’];
Const HOL_INFO = {
 R:{n:’Realista’,d:’Práctico y concreto. Le atraen las tareas manuales, técnicas y al aire libre, con herramientas, máquinas y objetos.’,t:’poco sociable, materialista, retraída, conformista, natural, estable, sincera, normal, ahorrativa, auténtica, persistente, táctica, no complicada’},
 I:{n:’Investigador’,d:’Curioso y analítico. Disfruta observar, investigar y comprender ideas o fenómenos de manera abstracta.’,t:’analítica, introspectiva, racional, cautelosa, introvertida, reservada, crítica, metódica, modesta, curiosa, pasiva, poco popular, independiente, pesimista, intelectual, precisa’},
 A:{n:’Artístico’,d:’Creativo e independiente. Busca expresarse con formas, sonidos o palabras y valora lo estético y lo original.’,t:’complicada, imaginativa, intuitiva, desordenada, poco práctica, no conformista, emocional, impulsiva, original, independiente, idealista, introspectiva’},
 S:{n:’Social’,d:’Empático y colaborador. Se motiva ayudando, enseñando y acompañando a otras personas.’,t:’influyente, servicial, responsable, cooperativa, idealista, sociable, perspicaz, discreta, amistosa, amable, comprensiva, generosa, persuasiva’},
 E:{n:’Emprendedor’,d:’Persuasivo y con iniciativa. Le atraen liderar, convencer, negociar y asumir riesgos.’,t:’adquisitiva, dominante, optimista, aventurera, enérgica, hedonista, ambiciosa, exhibicionista, confiada en sí misma, discutidora, engreída, sociable, confiable, impulsiva, locuaz’},
 C:{n:’Convencional’,d:’Ordenado y metódico. Se siente cómodo con tareas organizadas, precisas y con reglas claras.’,t:’conformista, inhibida, escrupulosa, obediente, controlada, defensiva, ordenada, poco imaginativa, eficiente, persistente, inflexible, práctica’}
};
/* ---------- CHASIDE: claves (10 ítems de intereses + 4 de aptitudes por área) ---------- */
Const CHA_KEYS = [‘C’,’H’,’A’,’S’,’I’,’D’,’E’];
Const CHA_INFO = {
 C:’Administrativas y contables’, H:’Humanísticas y sociales’, A:’Artísticas’, S:’Medicina y ciencias de la salud’,
 I:’Ingeniería y computación’, D:’Defensa y seguridad’, E:’Ciencias exactas y agrarias’
};
Const CHA_INT = {
 C:[98,12,64,53,85,1,78,20,71,91], H:[9,34,80,25,95,67,41,74,56,89], A:[21,45,96,57,28,11,50,3,81,36],
 S:[33,92,70,8,87,62,23,44,16,52], I:[75,6,19,38,60,27,83,54,47,97], D:[84,31,48,73,5,65,14,37,58,24],
 E:[77,42,88,17,93,32,68,49,35,61]
};
Const CHA_APT = {
 C:[15,51,2,46], H:[63,30,72,86], A:[22,39,76,82], S:[69,40,29,4], I:[26,59,90,10], D:[13,66,18,43], E:[94,7,79,55]
};
/* ---------- Materias (formación previa) ---------- */
Const SUBJECTS = [
 [‘mate’,’Matemática’],[‘fis’,’Física’],[‘qui’,’Química’],[‘bio’,’Biología’],[‘len’,’Lengua y Literatura’],
 [‘his’,’Historia’],[‘geog’,’Geografía’],[‘idi’,’Idiomas extranjeros’],[‘art’,’Arte, dibujo o plástica’],[‘mus’,’Música’],
 [‘ef’,’Educación Física’],[‘inf’,’Informática o tecnología’],[‘eco’,’Economía o contabilidad’],[‘soc’,’Filosofía, psicología o formación ciudadana’]
];
Const SUBJ_PTS = {Alto:100, Medio:55, Bajo:10};

/* ---------- Campos de estudio: cruce entre instrumentos ---------- */
/* Equivalencias CIP-R / Holland según el manual SOVI-3; el resto son propuestas orientativas editables. */
Const FIELDS = [
 {id:’cal’,cip:’cal’,n:’Cálculo y razonamiento matemático’,iami:[‘LM’],hol:[‘C’,’I’],cha:[‘C’,’I’],subj:[‘mate’,’inf’],
  Car:[‘Ingeniería en Sistemas’,’Ciencias de la Computación’,’Contador Público’,’Estadística’,’Matemática’]},
 {id:’cie’,cip:’cie’,n:’Ciencias básicas’,iami:[‘LM’,’NAT’],hol:[‘I’],cha:[‘E’],subj:[‘fis’,’qui’,’mate’,’bio’],
  Car:[‘Bioquímica’,’Química’,’Física’,’Biotecnología’]},
 {id:’dis’,cip:’dis’,n:’Diseño, arquitectura y construcción’,iami:[‘ESP’],hol:[‘R’,’A’],cha:[‘I’,’A’],subj:[‘art’,’mate’,’fis’],
  Car:[‘Arquitectura’,’Diseño Industrial’,’Ingeniería Civil’,’Diseño Gráfico’]},
 {id:’tec’,cip:’tec’,n:’Tecnología e ingeniería’,iami:[‘LM’,’ESP’],hol:[‘R’,’I’],cha:[‘I’],subj:[‘fis’,’inf’,’mate’],
  Car:[‘Ingeniería Electrónica’,’Ingeniería Mecánica’,’Ingeniería en Sistemas’,’Ingeniería Industrial’]},
 {id:’geo’,cip:’geo’,n:’Geociencias y astronomía’,iami:[‘NAT’,’LM’],hol:[‘I’],cha:[‘E’],subj:[‘fis’,’geog’],
  Car:[‘Astronomía’,’Geología’,’Meteorología’]},
 {id:’nat’,cip:’nat’,n:’Ciencias naturales y agropecuarias’,iami:[‘NAT’],hol:[‘R’,’I’],cha:[‘E’],subj:[‘bio’,’qui’,’geog’],
  Car:[‘Ingeniería Agronómica’,’Veterinaria’,’Biología’,’Bromatología’,’Ciencias Ambientales’]},
 {id:’san’,cip:’san’,n:’Salud’,iami:[‘NAT’,’INTER’],hol:[‘I’,’S’],cha:[‘S’],subj:[‘bio’,’qui’],
  Car:[‘Medicina’,’Odontología’,’Kinesiología o Fisioterapia’,’Enfermería’,’Nutrición’,’Farmacia’]},
 {id:’asi’,cip:’asi’,n:’Asistencia, educación y trabajo social’,iami:[‘INTER’,’INTRA’],hol:[‘S’],cha:[‘S’,’H’],subj:[‘soc’,’len’],
  Car:[‘Psicología’,’Trabajo Social’,’Psicopedagogía’,’Ciencias de la Educación’,’Profesorados’]},
 {id:’jur’,cip:’jur’,n:’Derecho y ciencias políticas’,iami:[‘INTER’,’LIN’],hol:[‘E’,’S’],cha:[‘H’,’D’],subj:[‘soc’,’his’,’len’],
  Car:[‘Abogacía’,’Ciencia Política’,’Relaciones Internacionales’]},
 {id:’eco’,cip:’eco’,n:’Economía y administración’,iami:[‘LM’,’INTER’],hol:[‘E’,’C’],cha:[‘C’],subj:[‘eco’,’mate’],
  Car:[‘Contador Público’,’Administración de Empresas’,’Economía’,’Marketing’]},
 {id:’com’,cip:’com’,n:’Comunicación y medios’,iami:[‘LIN’,’INTER’],hol:[‘A’,’E’],cha:[‘H’,’A’],subj:[‘len’,’his’,’soc’],
  Car:[‘Periodismo’,’Comunicación Social’,’Cinematografía’,’Relaciones Públicas’]},
 {id:’hum’,cip:’hum’,n:’Humanidades’,iami:[‘LIN’,’INTRA’],hol:[‘A’,’I’],cha:[‘H’],subj:[‘len’,’his’,’soc’],
  Car:[‘Letras’,’Historia’,’Filosofía’,’Sociología’]},
 {id:’art’,cip:’art’,n:’Artes visuales’,iami:[‘ESP’],hol:[‘A’],cha:[‘A’],subj:[‘art’],
  Car:[‘Artes Plásticas’,’Pintura’,’Diseño Gráfico’,’Arquitectura’]},
 {id:’mus’,cip:’mus’,n:’Música’,iami:[‘MUS’],hol:[‘A’],cha:[‘A’],subj:[‘mus’],
  Car:[‘Música’,’Composición y arreglos’,’Dirección orquestal’,’Producción musical’]},
 {id:’lin’,cip:’lin’,n:’Lenguas e idiomas’,iami:[‘LIN’],hol:[‘A’,’S’],cha:[‘H’],subj:[‘idi’,’len’],
  Car:[‘Traductorado’,’Profesorado de idiomas’,’Turismo’,’Relaciones Internacionales’]},
 {id:’seg’,cip:null,n:’Defensa y seguridad’,iami:[‘CIN’,’INTER’],hol:[‘R’,’E’],cha:[‘D’],subj:[‘ef’,’soc’],
  Car:[‘Fuerzas Armadas y de Seguridad’,’Criminalística’,’Seguridad e higiene’]},
 {id:’dep’,cip:null,n:’Deporte y actividad física’,iami:[‘CIN’],hol:[‘R’,’S’],cha:[‘S’,’D’],subj:[‘ef’,’bio’],
  Car:[‘Educación Física’,’Kinesiología’,’Entrenamiento deportivo’]}
];
/* ---------- Instrumentos: presentación ---------- */
Const TESTS = {
 Cip:{key:’cip’,short:’CIP-R’,name:’Intereses profesionales’,n:114,min:15,txt:CIP_TXT,label:’Actividad’,
  Opts:[[‘A’,’Me agrada’],[‘I’,’Me es indiferente’],[‘D’,’Me desagrada’]],
  Intro:[‘Vas a leer actividades propias de trabajos profesionales o de tareas que se hacen al estudiar una carrera.’,
         ‘Indicá si te resulta de agrado, indiferente o desagrado. No hay respuestas correctas ni incorrectas: es un registro de tus preferencias.’,
         ‘Respondé de forma personal y sin apuro.’]},
 Hol:{key:’hol’,short:’Holland’,name:’Personalidad e intereses’,n:90,min:10,txt:HOL_TXT,label:’Frase’,num:true,
  Opts:[[1,’Sí, lo diría, haría o pensaría’],[0,’No, no me representa’]],
  Intro:[‘Vas a leer frases. Respondé Sí en las que sentís claramente que son cosas que dirías, harías o pensarías.’,
         ‘Respondé No en las demás. Andá con tu primera impresión.’]},
 Cha:{key:’cha’,short:’CHASIDE’,name:’Intereses y aptitudes por área’,n:98,min:12,txt:CHA_TXT,label:’Pregunta’,num:true,
  Opts:[[1,’Sí’],[0,’No’]],
  Intro:[‘Leé cada pregunta y respondé Sí si la contestarías afirmativamente; No en caso contrario.’,
         ‘Respondé todas las preguntas, sin omitir ninguna.’]},
 Iami:{key:’iami’,short:’IAMI’,name:’Confianza en tus habilidades’,n:69,min:12,txt:IAMI_TXT,label:’Actividad’,num:true,
  Intro:[‘Cada ítem nombra una actividad. Indicá qué confianza tenés hoy en poder hacerla bien, del 1 (no puedo hacerlo) al 10 (totalmente seguro/a de poder hacerlo).’,
         ‘No se pregunta si te gusta, sino cuánta confianza tenés en tu habilidad actual. Ejemplo: “Jugar ajedrez” con un 3 indica poca seguridad.’,
         ‘Respondé con honestidad; no hay tiempo límite.’]}
};
const QUIEN_Q = [
 '¿Para qué tenés habilidades o qué podés hacer bien?','¿Qué es lo que te gusta hacer?','¿Cuáles han sido tus logros?',
 '¿Con qué dificultades o problemas te has encontrado para tu realización?','¿Qué te gustaría ser?','¿Qué elegirías hoy como profesión?',
 '¿Qué tenés claro sobre tu decisión vocacional?','¿Qué necesitás saber para realizar tu elección vocacional?','¿Te preocupa tu decisión vocacional?'
];
const AUTO_Q = [
 ['pasado','Mi pasado','Contá cómo fue tu infancia y tu recorrido escolar: hechos que te marcaron, lo que disfrutabas, lo que se te daba bien.'],
 ['presente','Mi presente','Cómo son hoy tu familia, tus amistades, tu tiempo libre y tus estudios. Qué te preocupa y qué te entusiasma.'],
 ['futuro','Mi futuro','Cómo te imaginás dentro de cinco y de veinte años: qué hacés, dónde vivís, con quién.'],
 ['soy','La clase de persona que creo ser','Descripción libre de cómo te ves.'],
 ['otros','La clase de persona que los demás creen que soy','Qué dirían de vos tu familia, tus amigos y tus docentes.'],
 ['quiero','La clase de persona que me gustaría ser','Qué te gustaría cambiar, sumar o mantener.']
];
const DESI_Q = [
 ['Si no fueras quien sos, ¿quién te gustaría ser?','Muestra coincidencias y discrepancias actuales con la problemática ocupacional.'],
 ['Si no fueras quien sos, ¿qué persona de la antigüedad te gustaría ser?','Conecta con aspectos omnipotentes y con el ideal perdido.'],
 ['Si no fueras quien sos, ¿qué persona del sexo opuesto te gustaría ser?','Conecta con lo complementario, lo que se deja de lado o se aspira a incluir.'],
 ['¿Qué persona te gustaría ser dentro de 20 años?','Da un salto sobre el desarrollo de la identidad ocupacional y lo conecta con el Ideal del Yo y los modelos de identificación.'],
 ['¿Quién no te gustaría ser si no fueras quien sos?','Muestra rasgos rechazados y características desagradables respecto de la elección de vida.']
];
const DESI_GUIA = [
 'Identificaciones realistas o fantaseadas (tipo)','Identificaciones benignas o aterrorizantes (calidad)','Identificaciones normativas y culturales',
 'Identificaciones yoicas: distancia entre lo real y lo posible','Identificaciones con el grupo familiar','Identificaciones con el grupo de pares',
 'Identificaciones por la contraria respecto del grupo de pertenencia','Mecanismos de defensa (dudas, bloqueos, ansiedad al responder)','Identidad sexual (especialmente consignas 3 y 5)'
];
/* ---------- Holland: Autoconocimiento (hoja de corrección del .doc "Test Holland - Autoconocimiento") ---------- */
const AUT_ORD = ['R','I','S','C','E','A'];
const AUT_ADJ = ['Huraño','Discutidor','Arrogante','Capaz','Común y corriente','Conformista','Concienzudo','Curioso','Dependiente','Eficiente','Paciente','Dinámico','Femenino','Amistoso','Generoso','Dispuesto a ayudar','Inflexible','Insensible','Introvertido','Intuitivo','Irritable','Amable','De buenos modales','Varonil','Inconforme','Poco realista','Poco culto','Poco idealista','Impopular','Original','Pesimista','Hedonista','Práctico','Rebelde','Reservado','Culto','Lento de movimientos','Sociable','Estable','Esforzado','Fuerte','Suspicaz','Cumplido','Modesto','Poco convencional'];
const AUT_B = ['Distraído','Capacidad artística','Capacidad burocrática','Conservadurismo','Cooperación','Expresividad','Liderazgo','Gusto en ayudar a los demás','Capacidad matemática','Capacidad mecánica','Originalidad','Popularidad con el sexo opuesto','Capacidad para investigar','Capacidad científica','Seguridad en sí mismo','Comprensión de sí mismo','Comprensión de los demás','Pulcritud'];
const AUT_C = ['Estar feliz y satisfecho','Descubrir o elaborar un producto útil','Ayudar a quienes están en apuros','Llegar a ser una autoridad en algún tema','Llegar a ser un deportista destacado','Llegar a ser un líder en la comunidad','Ser influyente en asuntos públicos','Observar una conducta religiosa formal','Contribuir a la ciencia en forma teórica','Contribuir a la ciencia en forma técnica','Escribir bien (novelas, poemas)','Haber leído mucho','Trabajar mucho','Contribuir al bienestar humano','Crear buenas obras artísticas (teatro, pintura)','Llegar a ser un buen músico','Llegar a ser un experto en finanzas y negocios','Hallar un propósito real en la vida'];
const AUT_D = [
 ['Me gusta…',['Leer y meditar sobre los problemas','Anotar datos y hacer cómputos','Tener una posición poderosa','Enseñar o ayudar a los demás','Trabajar manualmente, usar equipos, herramientas','Usar mi talento artístico']],
 ['Mi mayor habilidad se manifiesta en…',['Negocios','Artes','Ciencias','Liderazgo','Relaciones humanas','Mecánica']],
 ['Soy muy incompetente en…',['Mecánica','Ciencia','Relaciones humanas','Negocios','Liderazgo','Artes']],
 ['La actividad que menos me agradaría es…',['Tener una posición de responsabilidad','Llevar pacientes mentales a actividades recreativas','Llevar registros exactos y complejos','Escribir un poema','Hacer algo que exija paciencia y precisión','Participar en actividades sociales muy formales']],
 ['Las materias que más me gustan son…',['Arte','Administración, contabilidad','Química, Física','Educación tecnológica, Mecánica','Historia','Ciencias sociales, Filosofía']]
];
const AUT_KA = {R:[3,11,18,21,24,27,35,44], I:[8,19,29,31,33,36,37,43], S:[4,14,15,16,17,22], C:[5,6,7,9,10,26,28,42], E:[2,12,23,32,38,39,40,41], A:[1,13,20,25,30,34,45]};
const AUT_KB = {R:[1,10,16], I:[9,13,14], S:[5,8,17], C:[3,4,18], E:[7,12,15], A:[2,6,11]};
const AUT_KC = {R:[2,5,12], I:[4,9,10], S:[3,14,18], C:[1,8,13], E:[6,7,17], A:[11,15,16]};
/* Parte D: letra (A=0…F=5) que suma a cada tipo, en el orden R,I,S,C,E,A */
const AUT_KD = ['EADBCF','FCEADB','CEAFBD','BFEDAC','DCFBEA'].map(s => s.split('').map(ch => ch.charCodeAt(0) - 65));
/* Partes B y C: se suma cuando la letra elegida es A. Columnas Más/Igual/Menos = A/B/C salvo B1, B16 y C12 (C/A/A) */
const AUT_REV_B = [1, 16], AUT_REV_C = [12];
const AUT_TXT = [].concat(
  AUT_ADJ.map(x => 'Parte A. ¿Este adjetivo te describe tal como sos, no como te gustaría ser?  «' + x + '»'),
  AUT_B.map(x => 'Parte B. Comparado con otras personas de tu edad, en esta característica sos: ' + x),
  AUT_C.map(x => 'Parte C. ¿Qué importancia le das a este logro, aspiración o meta? ' + x),
  AUT_D.map(x => 'Parte D. ' + x[0] + ' (elegí una sola opción)')
);
TESTS.aut = {key:'aut',short:'Autoconocimiento',name:'Holland: autoconocimiento',n:86,min:15,txt:AUT_TXT,label:'Ítem',num:true,
  opts:[[1,'Sí'],[0,'No']],
  optsAt: i => i < 45 ? [[1,'Sí, me describe'],[0,'No']]
    : i < 63 ? [[0,'Más que los demás'],[1,'Igual que los demás'],[2,'Menos que los demás']]
    : i < 81 ? [[0,'Muy importante'],[1,'Más o menos importante'],[2,'Poco importante']]
    : AUT_D[i - 81][1].map((t, k) => [k, t]),
  intro:['Cuatro partes: adjetivos que te describen, comparación con personas de tu edad, importancia de logros y metas, y preferencias.',
         'Definite tal como sos, no como te gustaría ser. No hay respuestas correctas ni incorrectas.']};
function scoreAut(a) {
  const z = () => ({R:0,I:0,S:0,C:0,E:0,A:0});
  const parts = {A: z(), B: z(), C: z(), D: z()};
  AUT_ORD.forEach(t => {
    AUT_KA[t].forEach(n => { if (a[n - 1] === 1) parts.A[t]++; });
    AUT_KB[t].forEach(n => { const v = a[44 + n]; const L = AUT_REV_B.includes(n) ? 'CAA' : 'ABC'; if (L[v] === 'A') parts.B[t]++; });
    AUT_KC[t].forEach(n => { const v = a[62 + n]; const L = AUT_REV_C.includes(n) ? 'CAA' : 'ABC'; if (L[v] === 'A') parts.C[t]++; });
  });
  AUT_KD.forEach((row, q) => { const t = AUT_ORD[row.indexOf(a[81 + q])]; if (t) parts.D[t]++; });
  const tot = z(); AUT_ORD.forEach(t => { tot[t] = parts.A[t] + parts.B[t] + parts.C[t] + parts.D[t]; });
  const order = AUT_ORD.slice().sort((x, y) => tot[y] - tot[x] || AUT_ORD.indexOf(x) - AUT_ORD.indexOf(y));
  return {tot, parts, order, code: order.slice(0, 3).join(''), tie: tot[order[2]] === tot[order[3]]};
}
