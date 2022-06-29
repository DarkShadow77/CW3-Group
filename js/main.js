
        var webstore = new Vue({
            el: '#app',
            data: {
                sitename: 'After School Lessons',
                products: [],
                cart: [],
                showProduct: true,
                
                searchItem: '',
                ascending: true,
                sortBy: 'subject',
                search: '',
                type: '',
                user: {
                    name: '',
                    number: ''
                }
            },

            async created() {
                let course = await fetch("https://cw2-individuals.herokuapp.com/collection/lessons")
                let result = await course.json()
                this.products = result
            },
            // created: function () {

            //     fetch('https://cw2-individuals.herokuapp.com/collection/lessons').then(
            //         function (response) {
            //             response.json().then(
            //                 function (json) {
            //                     vueapp.products = json
            //                 }
            //             )
            //         }
            //     )
            // },
            methods: {
                addToCart(product) {
                    // this.lessons.find(item => item.id == lesson.id).Numberofspaces -= 1;
                    // this.cart.push({ id: (this.cart.length + 1), ...lesson });
                    // // console.log('adding to cart', lesson.id)

                    this.cart.push({

                        _id: product._id,
                        subject: product.subject,
                        location: product.location,
                        price: product.price,
                        Numberofspaces: product.Numberofspaces,
                        image: product.image

                    })

                    for (let i = 0; i < this.products.length; i++) {

                        if (product.subject === this.products[i].subject) {

                            let newSpace = this.products[i].Numberofspaces - 1
                            this.products[i].Numberofspaces = newSpace
                        }
                    }
                },
                removeFromCart(product) {
                    if (confirm('You are about to delete this!')) {
                        // this.cart = [...this.cart].filter(item => item.id != lesson.id)
                        for (let i = 0; i < this.cart.length; i++) {

                            if (this.cart[i].subject === product.subject) {

                                this.cart.splice(i, 1);

                                product.Numberofspaces++;

                                if (this.cart.length === 0) {

                                    this.showProduct = true;
                                }
                                break;
                            }
                        }

                        for (let i = 0; i < this.products.length; i++) {

                            if (product.subject === this.products[i].subject) {

                                let newSpace = this.products[i].Numberofspaces + 1
                                this.products[i].Numberofspaces = newSpace
                            }
                        }
                    }
                    
                },
                showCheckout() {
                    this.showProduct = this.showProduct ? false : true;
                },
                submit() {

                    lessonId = [];

                    for (let i = 0; i < this.cart.length; i++) {

                        lessonId.push({
                            id: this.cart[i]._id,
                            Numberofspaces: 1
                        })
                    }

                    let newOrder = {
                        name: this.user.name,
                        phone_number: this.user.number,
                        lessons: lessonId
                    }

                    fetch('https://cw2-individuals.herokuapp.com/collection/orderss', {

                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: "cors",
                        cache: "no-store",
                        body: JSON.stringify(newOrder),
                    })
                    .then(response => response.json())
                    
                    this.putLesson()
                    
                    .catch((error) => {
                        console.log(error);
                    });
                        
                    
                    // let orders = {
                    //     checkoutName: this.user.name,
                    //     checkoutPhone: this.user.number,
                    //     cartProduct: this.cart,
                    // }

                    // fetch('https://cw2-individuals.herokuapp.com/collection/order', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //     },
                    //     mode: "cors",
                    //     cache: "no-store",
                    //     body: JSON.stringify(orders),
                    // })
                    // .then(response => response.json())
                    // .then(data => {
                    //     this.putLesson()
                    // })
                    // .catch((error) => {
                    //     console.log(error);
                    // });

                },
                submitForm() {
                    alert('Order Successful!');
                },
                putLesson() {
                    for (let i = 0; i < this.cart.length; i++) {

                        fetch('https://cw2-individuals.herokuapp.com/collection/lessons/' + this.cart[i]._id, {

                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "Numberofspaces": this.cart[i].Numberofspaces - 1
                            }),
                        })
                        .then(response => response.json())
                           
                    }
                },
                filteredList(){
                    fetch('https://cw2-individuals.herokuapp.com/collection/lessons/search?key_word=${this.search}')
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        this.products = data
                    })
                },
                phonenumber(number) {
                    if ((number.match(phoneno))) {
                        return true;
                    } 
                },
            },
            computed: {
                total() {
                    return this.cart.length > 0 ? this.cart.map(product => product.price).reduce((acc, cur) => acc + cur) : 0;
                },

                sortedLessons() {
                    let sortedLessons = this.products;
                    
                    // if (this.search != '' && this.search) {
                    //     sortedLessons = sortedLessons.filter((item) => {
                    //         return item.subject
                    //         .toUpperCase()
                    //         .includes(this.search.toUpperCase())
                    //     })
                    // }

                    // Sort by alphabetical order
                    sortedLessons = sortedLessons.sort((a, b) => {
                        if (this.sortBy == 'subject') {
                            let fa = a.subject.toLowerCase(), fb = b.subject.toLowerCase()
                        
                            if (fa < fb) {
                            return -1
                            }
                            if (fa > fb) {
                            return 1 
                            }
                            return 0
                            
                        // Sort by price
                        } else if (this.sortBy == 'price') {
                            return a.price - b.price

                        // Sort by location
                        } else if (this.sortBy == 'location') {
                            let fa = a.location.toLowerCase(), fb = b.location.toLowerCase()
                        
                            if (fa < fb) {
                            return -1
                            }
                            if (fa > fb) {
                            return 1 
                            }
                            return 0
                            
                        } 
                    })
                    
                    // Show sorted array in descending or ascending order
                    if (!this.ascending) {
                        sortedLessons.reverse()
                    }

                    return sortedLessons;
                }
            },

            watch: {

                searchItem: async function () {

                    if (this.searchItem.length > 0) {

                        await fetch('https://cw2-individuals.herokuapp.com/search/lessons/' + this.searchItem).then(
                            function (response) {
                                response.json().then(
                                    function (json) {
                                        vueapp.products = json
                                    }
                                )
                            }
                        )

                    } else {

                        fetch('https://cw2-individuals.herokuapp.com/collection/lessons').then(
                            function (response) {
                                response.json().then(
                                    function (json) {
                                        vueapp.products = json
                                    }
                                )
                            }
                        )
                    }
                }
            }

        });