// Referências para os elementos do HTML
var inputCep = document.getElementById("input-cep");
var btnBuscarCep = document.getElementById("btn-buscar-cep");

var inputUf = document.getElementById("input-uf");
var inputCidade = document.getElementById("input-cidade");
var inputRua = document.getElementById("input-rua");
var btnBuscarEndereco = document.getElementById("btn-buscar-endereco");

var btnLimpar = document.getElementById("btn-limpar");

var mensagemErro = document.getElementById("mensagem-erro");
var divResultados = document.getElementById("div-resultados");
var listaHistorico = document.getElementById("lista-historico");

// Carrega o histórico salvo no localStorage
var historico = [];
var historicoSalvo = localStorage.getItem("meuHistoricoCep");
if (historicoSalvo != null) {
    historico = JSON.parse(historicoSalvo);
}

// Mostra o histórico na tela ao abrir a página
mostrarHistorico();

// 1. Pesquisa por CEP
btnBuscarCep.onclick = function() {
    var cep = inputCep.value;
    
    // Validação básica
    if (cep.length != 8) {
        mensagemErro.innerHTML = "O CEP deve ter 8 números.";
        divResultados.innerHTML = "";
        return;
    }

    mensagemErro.innerHTML = "Buscando...";
    divResultados.innerHTML = "";

    // Requisição fetch (promessas/then)
    fetch("https://viacep.com.br/ws/" + cep + "/json/")
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(dados) {
            if (dados.erro == true) {
                mensagemErro.innerHTML = "CEP não encontrado.";
            } else {
                mensagemErro.innerHTML = "";
                
                // Exibe o resultado na tela
                divResultados.innerHTML = 
                    "<div class='resultado-item'>" +
                    "<p><strong>CEP:</strong> " + dados.cep + "</p>" +
                    "<p><strong>Logradouro:</strong> " + dados.logradouro + "</p>" +
                    "<p><strong>Bairro:</strong> " + dados.bairro + "</p>" +
                    "<p><strong>Cidade/UF:</strong> " + dados.localidade + " / " + dados.uf + "</p>" +
                    "</div>";

                // Salva no histórico
                salvarNoHistorico(dados.cep);
            }
        })
        .catch(function(erro) {
            mensagemErro.innerHTML = "Erro ao conectar com a API ViaCEP.";
            console.log(erro);
        });
};

// 2. Pesquisa por Endereço
btnBuscarEndereco.onclick = function() {
    var uf = inputUf.value;
    var cidade = inputCidade.value;
    var rua = inputRua.value;

    if (cidade == "" || rua == "") {
        mensagemErro.innerHTML = "Preencha a cidade e o logradouro (rua).";
        divResultados.innerHTML = "";
        return;
    }

    mensagemErro.innerHTML = "Buscando...";
    divResultados.innerHTML = "";

    // A API pede UF/Cidade/Rua (logradouro)
    var url = "https://viacep.com.br/ws/" + uf + "/" + cidade + "/" + rua + "/json/";

    fetch(url)
        .then(function(resposta) {
            return resposta.json();
        })
        .then(function(dados) {
            // Se retornar uma lista vazia
            if (dados.length == 0) {
                mensagemErro.innerHTML = "Nenhum endereço encontrado.";
                return;
            }

            mensagemErro.innerHTML = "";
            var htmlResultados = "";

            // Como pode retornar mais de um CEP, vamos usar um laço (for)
            for (var i = 0; i < dados.length; i++) {
                var endereco = dados[i];
                htmlResultados += 
                    "<div class='resultado-item'>" +
                    "<p><strong>CEP:</strong> " + endereco.cep + "</p>" +
                    "<p><strong>Logradouro:</strong> " + endereco.logradouro + "</p>" +
                    "<p><strong>Bairro:</strong> " + endereco.bairro + "</p>" +
                    "<p><strong>Cidade/UF:</strong> " + endereco.localidade + " / " + endereco.uf + "</p>" +
                    "</div>";
            }

            divResultados.innerHTML = htmlResultados;
        })
        .catch(function(erro) {
            mensagemErro.innerHTML = "Erro ao conectar com a API ViaCEP.";
            console.log(erro);
        });
};

// 3. Funções do Histórico
function salvarNoHistorico(cepPesquisado) {
    // Evitar salvar duplicado logo em seguida
    if (historico[0] != cepPesquisado) {
        // Coloca no começo da lista
        historico.unshift(cepPesquisado);
        
        // Mantém apenas os últimos 5
        if (historico.length > 5) {
            historico.pop();
        }

        // Salva no localStorage (precisa transformar em texto)
        localStorage.setItem("meuHistoricoCep", JSON.stringify(historico));
        
        // Atualiza a tela
        mostrarHistorico();
    }
}

function mostrarHistorico() {
    listaHistorico.innerHTML = "";

    for (var i = 0; i < historico.length; i++) {
        var cep = historico[i];
        
        var li = document.createElement("li");
        li.innerHTML = "Pesquisa: " + cep;
        
        // Adiciona um evento para que, ao clicar, pesquise de novo
        li.onclick = criarFuncaoCliqueHistorico(cep);

        listaHistorico.appendChild(li);
    }
}

// Uma função separada para criar o evento de clique corretamente em um loop for (conceito de closure, útil até para iniciantes não terem bugs)
// Outra forma mais simples que os iniciantes usam é o let, mas vamos manter simples!
function criarFuncaoCliqueHistorico(cepClicado) {
    return function() {
        // Preenche o campo e clica no botão de busca automaticamente
        inputCep.value = cepClicado.replace("-", ""); // tira o traço se tiver
        btnBuscarCep.onclick(); // chama a função de buscar
    }
}

// 4. Botão Limpar
btnLimpar.onclick = function() {
    inputCep.value = "";
    inputCidade.value = "";
    inputRua.value = "";
    divResultados.innerHTML = "";
    mensagemErro.innerHTML = "";
};
