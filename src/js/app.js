(function(){
	'use strict';

	const searchURL = 'https://api.github.com/search/repositories',  
		  gistURL = 'https://api.github.com/gists',
		  authURL = 'https://api.github.com/user',  
		  searchParams = {
			q: '',
			sort: '',
			order: 'asc'
		  };

	let searchInput = document.querySelector('.rep-search'),
		searchTemplate = document.getElementById('rep-template').innerHTML,
		searchResult = document.querySelector('.rep-content'),
		gistTemplate = document.getElementById('gist-template').innerHTML,
		gistResult = document.querySelector('.gist__link'),
		gistForm = document.querySelector('.gist__form'),
		profileTemplate = document.getElementById('profile-template').innerHTML,		
		profileResult = document.querySelector('.profile'),
		authBlock = document.querySelector('.auth-block');	

	let authObj = {
		form: document.forms.authForm,
		profile: {
			image: document.querySelector('.profile__image'),
			name: document.querySelector('.profile__name'),
			btnLogout: document.querySelector('.profile__logout')
		}
	};	

	/* ---Classes--- */	
	class SearchController {
		constructor(input, url, params) {
			this.input = input;
			this.url = url;
			this.params = params;

			this.request();			
		}
		request() {
			let ajax = new XMLHttpRequest(),
				that = this;

			let requestStr = (obj) => {
				let str = '?';
				_.forEach(obj, function(value, key) {
					if (value !== ''){
						str += `${key}=${value}&`;
					}					
				});
				return str;
			}

			this.input.addEventListener('keyup', function(event) {
				if (this.value.length > 3) {
					that.params.q = this.value;
					ajax.open('GET', `${that.url}${requestStr(that.params)}`);
					if (auth.isAutorized) {
						ajax.setRequestHeader('Authorization', `Basic ${auth.keyBase64}`);
					};
					ajax.send();
				}
			});

			this.input.addEventListener('keydown', function(event) {
				ajax.abort();
			});			

			ajax.onreadystatechange = function() {
			  if (this.readyState != 4) return;

			  if (this.status != 200) {
			    return;
			  }

			  let searchData = JSON.parse(this.responseText).items.slice(0, 3);

			  searchRender.render(searchData);			  			    
			}
		}			
	}
	
	class GistController {
		constructor(form, gistURL) {
			this.form = form;
			this.url = gistURL;

			this.form.onsubmit = this.submitControl.bind(this);
		}
		submitControl(e) {
			e.preventDefault();

			let ajax = new XMLHttpRequest(),
				that = this;		

			let gistName = this.form.gistName.value,
				gistContent = this.form.gistContent.value,
				gistObj = this.gistSendObj(gistName, gistContent);
				
			ajax.open('POST', `${this.url}`);
			if (auth.isAutorized) {
				ajax.setRequestHeader('Authorization', `Basic ${auth.keyBase64}`);
			};				
			ajax.send(JSON.stringify(gistObj));					

			ajax.onreadystatechange = function() {
			  if (this.readyState != 4) return;

			  if (this.status != 201) {
			    console.warn( 'ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
			    return;
			  }

			  let gistData = JSON.parse(this.responseText);
			  gistRender.render(gistData);    
			}				
		}
		gistSendObj(file, content) {
			return  {
						"files": {
							[file]: {
							  "content": content
							}
						}
					}
		}
	}

	class Authorization {
	  constructor(options) { 
	  	this.options = options;   

	    this.form = options.form;
	    this.login = options.form.login;
	    this.password = options.form.password;
	    this.profileImage = options.profile.image;
	    this.profileName = options.profile.name;	    
	    this.isAutorized = null;

	    this.form.onsubmit = this.formSubmit.bind(this);
	  }

	  formSubmit(e) {
	    e.preventDefault();

	    if (this.login === null) {
	      this.login = this.options.login;
	      this.password = this.options.password;
	    }

	    this.keyBase64 = window.btoa(this.login.value + ':' + this.password.value);

	    let ajax = new XMLHttpRequest(),
			that = this;

		ajax.open('GET', `${authURL}`);
		ajax.setRequestHeader('Authorization', `Basic ${this.keyBase64}`);
		ajax.send();	 

		ajax.onreadystatechange = function() {
		  if (this.readyState != 4) return;

		  if (this.status != 200) {
		    console.warn( 'ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
		    return;
		  }

		  that.isAutorized = true; 

		  let profileData = JSON.parse(this.responseText);
		  authRender.render(profileData);

		  authBlock.classList.add('auth-block--authorized');
		  that.btnLogout = document.querySelector('.profile__logout'); 
		  that.btnLogout.onclick = that.logout.bind(that); 
		}	
	  }

	  logout() {
	  		authBlock.classList.remove('auth-block--authorized');	    
			this.keyBase64 = null;
			this.isAutorized = null;
	  }	
	}

	class Render {
		constructor(elem, template = '') {
			this.elem = elem;
			this.template = template;			
		}
		render(data) {
			let compiled = _.template(this.template);
			this.elem.innerHTML = compiled({ items: data });
		}
	}

	let search = new SearchController(searchInput, searchURL, searchParams),
		searchRender = new Render(searchResult, searchTemplate),
		gist = new GistController(gistForm, gistURL),
		gistRender = new Render(gistResult, gistTemplate),
		auth = new Authorization(authObj),
		authRender = new Render (profileResult, profileTemplate);	
})();