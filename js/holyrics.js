/*
 * holyrics.js — cliente simples do API Server do Holyrics.
 * Consulta GetCurrentPresentation e avisa quando o slide no ar muda.
 * Doc oficial: https://github.com/holyrics/API-Server
 */
(function (global) {
  'use strict';

  /**
   * opcoes: { api: '' | 'http://IP:PORTA', token: '', intervalo: 400,
   *           aoMudar: function(info), aoErro: function(erro) }
   * info:   { ativo, texto, titulo, tipo, slide, total, tipoSlide, bruto }
   */
  function HolyricsClient(opcoes) {
    this.o = Object.assign({ api: '', token: '', intervalo: 400 }, opcoes || {});
    this.cache = { id: null, total: null, slides: null, nome: '' };
    this.rodando = false;
    this.timer = null;
  }

  HolyricsClient.prototype.chamar = function (acao, corpo) {
    var o = this.o;
    var url = o.api.replace(/\/$/, '') + '/api/' + acao + (o.token ? '?token=' + encodeURIComponent(o.token) : '');
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo || {}),
      cache: 'no-store'
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ': ' + t.slice(0, 200)); });
      return r.json();
    });
  };

  HolyricsClient.prototype.consultar = function () {
    var self = this, c = this.cache;
    return this.chamar('GetCurrentPresentation', { include_slides: !c.slides }).then(function (res) {
      if (!res || res.status !== 'ok') throw new Error('Resposta do Holyrics: ' + JSON.stringify(res).slice(0, 300));
      var d = res.data;
      if (!d) { c.id = null; c.slides = null; return { ativo: false, texto: '', titulo: '', bruto: null }; }

      // Apresentação nova (ou editada): recarrega a lista de slides.
      if (d.id !== c.id || d.total_slides !== c.total) {
        c.id = d.id; c.total = d.total_slides; c.nome = (d.name || '').trim(); c.slides = null;
        if (!d.slides) return self.consultar();
      }
      if (d.slides) c.slides = d.slides;

      var slide = null;
      if (c.slides) {
        slide = c.slides.filter(function (s) { return s.number === d.slide_number; })[0] ||
                c.slides[(d.slide_number || 1) - 1] || null;
      }
      var normal = !d.slide_type || d.slide_type === 'default';
      return {
        ativo: normal && !!slide,
        texto: (normal && slide) ? (slide.text || '') : '',
        capa: !!slide && HolyricsClient.ehCapa(slide.text, c.nome, d.slide_number),
        titulo: c.nome,
        tipo: d.type,
        slide: d.slide_number,
        total: d.total_slides,
        tipoSlide: d.slide_type,
        bruto: d
      };
    });
  };

  /**
   * O Holyrics costuma abrir a música com um slide de capa: "Nome\nArtista",
   * enquanto o nome do item vem como "Nome (Artista)". Detecta comparando só letras e números.
   */
  HolyricsClient.ehCapa = function (texto, nome, numero) {
    if (numero !== 1 || !texto || !nome) return false;
    var so = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, ''); };
    var t = so(texto), n = so(nome);
    return t.length > 0 && (t === n || n.indexOf(t) === 0 || t.indexOf(n) === 0);
  };

  HolyricsClient.prototype.iniciar = function () {
    var self = this;
    if (this.rodando) return;
    this.rodando = true;
    (function ciclo() {
      if (!self.rodando) return;
      self.consultar()
        .then(function (info) { self.o.aoMudar && self.o.aoMudar(info); })
        .catch(function (e) { self.o.aoErro && self.o.aoErro(e); })
        .then(function () { if (self.rodando) self.timer = setTimeout(ciclo, self.o.intervalo); });
    })();
  };

  HolyricsClient.prototype.parar = function () {
    this.rodando = false;
    clearTimeout(this.timer);
  };

  global.HolyricsClient = HolyricsClient;
})(typeof window !== 'undefined' ? window : globalThis);
