/*
 * lyrics-core.js — regras de formatação de letras (compartilhado por rodapé, TV e estúdio)
 * Espaço Novo Tempo Aracaju
 */
(function (global) {
  'use strict';

  var LC = {};

  /** Padrão recomendado para os slides do Holyrics (TV 49"). */
  LC.PADRAO = { maxLinhasSlide: 4, maxCaracteresLinha: 32 };

  /** Remove HTML (caso venha), decodifica entidades e devolve um array de linhas limpas. */
  LC.linhas = function (texto) {
    if (!texto) return [];
    var t = String(texto)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, '');
    if (typeof document !== 'undefined') {
      var ta = document.createElement('textarea');
      ta.innerHTML = t;
      t = ta.value;
    }
    return t
      .split(/\r?\n/)
      .map(function (s) { return s.replace(/\s+/g, ' ').trim(); })
      .filter(function (s) { return s.length > 0; });
  };

  /**
   * Agrupa as linhas de um slide em no máximo `max` linhas para o rodapé,
   * mantendo a ordem e equilibrando o tamanho (ex.: 4 linhas -> 1+2 / 3+4).
   */
  LC.paraRodape = function (linhas, max) {
    max = max || 2;
    if (linhas.length <= max) return linhas.slice();
    if (max === 1) return [linhas.join(' ')];
    // Particiona em `max` grupos contíguos minimizando o maior comprimento.
    var n = linhas.length;
    var melhor = null;
    function tam(a, b) { return linhas.slice(a, b).join(' ').length; }
    function busca(inicio, gruposRestantes, cortes) {
      if (gruposRestantes === 1) {
        var todos = cortes.concat([n]);
        var maior = 0, ant = 0;
        for (var i = 0; i < todos.length; i++) { maior = Math.max(maior, tam(ant, todos[i])); ant = todos[i]; }
        if (!melhor || maior < melhor.maior) melhor = { maior: maior, cortes: todos };
        return;
      }
      for (var c = inicio + 1; c <= n - (gruposRestantes - 1); c++) busca(c, gruposRestantes - 1, cortes.concat([c]));
    }
    busca(0, max, []);
    var res = [], a = 0;
    melhor.cortes.forEach(function (b) { res.push(linhas.slice(a, b).join(' ')); a = b; });
    return res;
  };

  // Palavras curtas que soam mal no fim de uma linha ("o", "de", "que"...).
  var PALAVRAS_FRACAS = /^(a|o|as|os|e|é|de|da|do|das|dos|em|na|no|nas|nos|um|uma|que|se|te|me|lhe|por|pra|pro|para|com|ao|à|meu|teu|seu|minha|tua|sua)$/i;

  /**
   * Quebra uma linha longa em pedaços <= maxChars. Escolhe o melhor espaço:
   * equilibrado, de preferência depois de pontuação e sem deixar palavra curta pendurada.
   */
  LC.quebrarLinha = function (linha, maxChars) {
    if (linha.length <= maxChars) return [linha];
    var melhor = -1, melhorNota = Infinity;
    for (var i = 1; i < linha.length - 1; i++) {
      if (linha[i] !== ' ') continue;
      var esq = linha.slice(0, i).trim(), dir = linha.slice(i + 1).trim();
      var nota = Math.abs(esq.length - dir.length);
      if (/[,;:.!?]$/.test(esq)) nota -= 12;                         // depois de pontuação: ótimo
      if (PALAVRAS_FRACAS.test(esq.split(' ').pop())) nota += 10;    // "...falhou, é" / "firme..."
      if (esq.length > maxChars) nota += 4 * (esq.length - maxChars); // ainda longo demais
      if (dir.length > maxChars) nota += 4 * (dir.length - maxChars);
      if (nota < melhorNota) { melhorNota = nota; melhor = i; }
    }
    if (melhor < 0) return [linha]; // palavra única gigante: não há o que fazer
    return LC.quebrarLinha(linha.slice(0, melhor).trim(), maxChars)
      .concat(LC.quebrarLinha(linha.slice(melhor + 1).trim(), maxChars));
  };

  /**
   * Divide um bloco em slides de no máximo `maxLinhas` linhas.
   * `unidades` = array de arrays: cada unidade é uma linha original (já quebrada em pedaços)
   * e nunca é separada entre dois slides. Usa o menor número de slides e equilibra o tamanho deles.
   */
  LC.dividirBloco = function (unidades, maxLinhas) {
    if (unidades.length && !Array.isArray(unidades[0])) unidades = unidades.map(function (l) { return [l]; });
    var n = unidades.length, tam = unidades.map(function (u) { return u.length; });
    // custo[i] = melhor forma de agrupar as unidades i..n-1
    var custo = new Array(n + 1), corte = new Array(n + 1);
    custo[n] = 0;
    for (var i = n - 1; i >= 0; i--) {
      custo[i] = Infinity;
      var soma = 0;
      for (var j = i; j < n; j++) {
        soma += tam[j];
        if (soma > maxLinhas && j > i) break;
        var sobra = Math.max(0, maxLinhas - soma);
        var c = 1000 + sobra * sobra + (soma % 2 ? 3 : 0) + custo[j + 1]; // 1000 = cada slide extra pesa muito
        if (c < custo[i]) { custo[i] = c; corte[i] = j + 1; }
      }
    }
    var res = [];
    for (var a = 0; a < n; a = corte[a]) res.push([].concat.apply([], unidades.slice(a, corte[a])));
    return res;
  };

  /** Lê uma letra inteira (slides separados por linha em branco) e devolve array de slides (arrays de linhas). */
  LC.lerLetra = function (texto) {
    return String(texto || '')
      .replace(/\r/g, '')
      .split(/\n\s*\n/)
      .map(function (b) { return LC.linhas(b); })
      .filter(function (s) { return s.length > 0; });
  };

  /** Reformata a letra inteira no padrão (máx. N linhas por slide, máx. M caracteres por linha). */
  LC.formatarLetra = function (texto, opcoes) {
    var o = Object.assign({}, LC.PADRAO, opcoes || {});
    var slides = [];
    LC.lerLetra(texto).forEach(function (bloco) {
      var unidades = bloco.map(function (l) { return LC.quebrarLinha(l, o.maxCaracteresLinha); });
      slides = slides.concat(LC.dividirBloco(unidades, o.maxLinhasSlide));
    });
    return slides;
  };

  /** Converte slides (arrays de linhas) de volta para texto no formato do Holyrics. */
  LC.slidesParaTexto = function (slides) {
    return slides.map(function (s) { return s.join('\n'); }).join('\n\n');
  };

  /** Avisos de um slide em relação ao padrão. */
  LC.avisos = function (linhas, opcoes) {
    var o = Object.assign({}, LC.PADRAO, opcoes || {});
    var av = [];
    if (linhas.length > o.maxLinhasSlide) av.push(linhas.length + ' linhas (máx. ' + o.maxLinhasSlide + ')');
    var longas = linhas.filter(function (l) { return l.length > o.maxCaracteresLinha; }).length;
    if (longas) av.push(longas + ' linha(s) com mais de ' + o.maxCaracteresLinha + ' caracteres');
    return av;
  };

  global.LyricsCore = LC;
})(typeof window !== 'undefined' ? window : globalThis);
