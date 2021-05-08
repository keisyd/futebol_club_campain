"use strict";
require("es6-promise").polyfill();
const fs = require("fs");

const request = require("request");
const cheerio = require("cheerio");

const urlBase = "http://globoesporte.globo.com/futebol/brasileirao-serie-";
var rodadaBaseURL =
  "https://globoesporte.globo.com/servico/backstage/esportes_campeonato/esporte/futebol/modalidade/futebol_de_campo/categoria/profissional/campeonato/campeonato-brasileiro/edicao/campeonato-brasileiro-2018/fases/fase-unica-seriea-2018/rodada/%s/jogos.html";
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9";

var rodadaAtual = function (serie, rodada) {
  rodadaBaseURL = rodadaBaseURL.replace("%s", rodada);
  return new Promise(function (accept, error) {
    var options = {
      url: rodadaBaseURL,
      headers: {
        "User-Agent": userAgent,
      },
    };
    request(options, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var lista = [];

        $(".lista-de-jogos-item").each(function () {
          var rodada = {};
          var item = $(this);
          rodada.mandante = item
            .find(".placar-jogo-equipes")
            .find(".placar-jogo-equipes-mandante")
            .find(".placar-jogo-equipes-sigla")
            .attr("title");
          rodada.placarMandante = item
            .find(".placar-jogo-equipes")
            .find(".placar-jogo-equipes-placar")
            .find(".placar-jogo-equipes-placar-mandante")
            .text();
          rodada.visitante = item
            .find(".placar-jogo-equipes")
            .find(".placar-jogo-equipes-visitante")
            .find(".placar-jogo-equipes-sigla")
            .attr("title");
          rodada.placarVisitante = item
            .find(".placar-jogo-equipes")
            .find(".placar-jogo-equipes-placar")
            .find(".placar-jogo-equipes-placar-visitante")
            .text();
          if (!rodada.placarMandante) rodada.placarMandante = 0;
          if (!rodada.placarVisitante) rodada.placarVisitante = 0;
          lista.push(rodada);
        });
        accept(lista);
      } else {
        error({ error: "Não foi possível retornar as informações!!" });
      }
    });
  });
};

var tabela = function (serie) {
  return new Promise(function (accept, error) {
    var options = {
      url: "http://globoesporte.globo.com/futebol/times/",
      headers: {
        "User-Agent": userAgent,
      },
    };
    request(options, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        fs.appendFile("add.txt", "List teams = new List<string>(){", function (err) {
          if (err) return console.log(err);
        });
        $(".lista-letras").each(function () {
          var item = $(this);
          
          item.find(".lista-letra").each(function () {
            var letra = $(this);
            letra.find(".theme-color").each(function(){
              var time = $(this);
              fs.appendFile("add.txt","\""+ time.text()+"\",\n", function (err) {
                if (err) return console.log(err);
                console.log(" \n "+ time.text()+" ");
              });
            })
          });
        });

        fs.appendFile("add.txt", "}", function (err) {
          if (err) return console.log(err);
        });
      }
      //
      else {
        error({ error: "Não foi possível retornar as informações!" });
      }
    });
  });
};

  

const serie = "a";

tabela(serie).then(
  function (tabela) {
    console.log(tabela);
  },
  function (err) {
    console.log(err);
  }
);


