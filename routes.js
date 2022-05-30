const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const customer = require('../models/customer');
const recipe = require('../models/recipe');
const comment = require('../models/comment');
const multer = require('multer');
const { GridFSBucketReadStream } = require('mongodb');
const fs = require('fs');
const order = require('../models/order');
router.use(express.static('uploads')); //傳送靜態檔案

//image upload 
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

//insert a comment
router.post('/add_comment', upload, (req, res) => {
    const cakecom = req.body.cake
    comment.findOneAndUpdate({ "cake": cakecom }, {
        $push: {
            word: [{
                comment_name: req.body.comment_name,
                comment_email: req.body.comment_email,
                comment: req.body.comment
            }]
        },
    }, { upsert: true }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'Comment add successfully',
            };
            res.redirect('back');
        }
    });
});

//insert an order into database route
router.post('/add_order', upload, (req, res) => {
        const orders = new order({
            order_id: req.body.order_id,
            sum: req.body.sum,
            account: req.body.account,
            product: [{
                cake: req.body.cake,
                price: req.body.price
            }],

            status: req.body.status,
            payment: req.body.payment,
            remarks: req.body.remarks
        });
        orders.save((err) => {
            if (err) {
                res.json({ message: err.message, type: 'danger' });
            } else {
                req.session.message = {
                    type: 'success',
                    message: 'Customer added successfully!'
                };
                res.redirect("/");
            }
        })
    })
    //insert an customer into database route
router.post('/add', upload, (req, res) => {
        const user = new customer({
            name: req.body.name,
            vip: req.body.vip,
            age: req.body.age,
            contact_obj: [{
                mobile: req.body.mobile,
                telephone: req.body.telephone,
                email: req.body.email
            }],
            gender: req.body.gender,
            account: req.body.account,
            pass: req.body.pass
        });
        user.save((err) => {
            if (err) {
                res.json({ message: err.message, type: 'danger' });
            } else {
                req.session.message = {
                    type: 'success',
                    message: 'Customer added successfully!'
                };
                res.redirect("/");
            }
        })
    })
    //insert a recipe into database route
router.post('/add_recipe', upload, (req, res) => {
    const recipes = new recipe({
        price: req.body.price,
        star: req.body.star,
        discription: req.body.discription,
        cake_name: req.body.cake_name,
        image: req.file.filename,
        count: req.body.count,
        category: req.body.category,
        website: req.body.website
    });
    recipes.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'Recipe added successfully!'
            };
            res.redirect("/menu");
        }
    })
})

///get top 3 cake display
router.get('/', (req, res) => {
    recipe.find().sort({ "star": -1 }).limit(3).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("index", {
                title: "Home Page",
                recipe: recipe,
            })
        }
    })

});


////edit user
router.get('/edits:id', (req, res) => {
    let id = req.params.id;
    customer.findById(id, (err, customers) => {
        if (err) {
            res.redirect("/");
        } else {
            if (customers == null) {
                res.redirect("/");
            } else {
                res.render("edit_users", {
                    title: "Edit user",
                    customers: customers,
                });
            }
        }
    });
});

////edit recipe
router.get('/edit:id', (req, res) => {
    let id = req.params.id;
    recipe.findById(id, (err, recipe) => {
        if (err) {
            res.redirect("/");
        } else {
            if (recipe == null) {
                res.redirect("/");
            } else {
                res.render("edit_recipes", {
                    title: "Edit recipes",
                    recipe: recipe,
                });
            }
        }
    });
});

////edit order
router.get('/edito:id', (req, res) => {
    let id = req.params.id;
    order.findById(id, (err, orders) => {
        if (err) {
            res.redirect("/");
        } else {
            if (orders == null) {
                res.redirect("/");
            } else {
                res.render("edit_orders", {
                    title: "edit orders",
                    orders: orders,
                });
            }
        }
    });
});

///update user ruote
router.post('/updates/:id', upload, (req, res) => {
    let id = req.params.id;
    //let new_img = '';
    customer.findByIdAndUpdate(id, {
        name: req.body.name,
        vip: req.body.vip,
        age: req.body.age,
        contact_obj: [{
            mobile: req.body.mobile,
            telephone: req.body.telephone,
            email: req.body.email
        }],
        gender: req.body.gender,
        account: req.body.account,
        //image: new_img,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'user update successfully',
            };
            res.redirect('/');
        }
    });
});

///update recipe ruote
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_img = '';
    if (req.file) {
        new_img = req.file.filenme;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_img);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_img = req.body.old_img;
    }
    recipe.findByIdAndUpdate(id, {
        price: req.body.price,
        star: req.body.star,
        discription: req.body.discription,
        cake_name: req.body.cake_name,
        category: req.body.category,
        image: new_img,
        /////count: req.body.count
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'recipe update successfully',
            };
            res.redirect('/');
        }
    });
});

///update order
router.post('/updateo/:id', upload, (req, res) => {
    let id = req.params.id;
    order.findByIdAndUpdate(id, {
        //order_id: req.body.order_id,
        //sum: req.body.sum,
        //account: req.body.account,
        product: [{
            cake: req.body.cake,
            price: req.body.price
        }],
        //status: req.body.status,
        payment: req.body.payment,
        remarks: req.body.remarks
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'order update successfully',
            };
            res.redirect('/');
        }
    });
});

///menu
router.get('/menu', (req, res) => {
    recipe.find().exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("menu", {
                title: "Menu",
                recipe: recipe,
            })
        }
    })
});
///show customer //for delete & edit
router.get('/show_users', (req, res) => {
    customer.find().exec((err, customer) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("show_users", {
                title: "all customer",
                customer: customer,
            })
        }
    })
});

//show recipe //for delete & edit
router.get('/show_recipes', (req, res) => {
    recipe.find().exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("show_recipes", {
                title: "all recipe",
                recipe: recipe,
            })
        }
    })

});

//show orders
router.get('/show_order', (req, res) => {
    order.find().exec((err, order) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("show_order", {
                title: "all order",
                order: order,
            })
        }
    })
});
//search_form
router.get('/Gallery', (req, res) => {
    res.render('search', { title: 'Search Cakes' });
});
///show result
router.get('/result', (req, res) => {
    const data = req.query.cake_name_search;
    recipe.find({ "star": "12" }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("result", {
                title: "Result",
                recipe: recipe,
            })
        }
    })
});

////delete user
router.get('/deletes/:id', (req, res) => {
    let id = req.params.id;
    customer.findByIdAndRemove(id, (err, result) => {
        if (err) {
            res.json({ message: message });
        } else {
            req.session.message = {
                type: "info",
                message: "delete successfully",
            };
            res.redirect("/");
        }
    });


});

////delete recipe
router.get('/delete/:id', (req, res) => {
    let id = req.params.id;
    recipe.findByIdAndRemove(id, (err, result) => {
        if (result.image != "") {
            try {
                fs.unlinkSync("./upload" + result.image);
            } catch (err) {
                console.log(err);
            }
        }
        if (err) {
            res.json({ message: message });
        } else {
            req.session.message = {
                type: "info",
                message: "delete successfully",
            };
            res.redirect("/");
        }
    });
});

////delete order
router.get('/deleteo/:id', (req, res) => {
    let id = req.params.id;
    order.findByIdAndRemove(id, (err, result) => {
        if (err) {
            res.json({ message: message });
        } else {
            req.session.message = {
                type: "info",
                message: "delete successfully",
            };
            res.redirect("/");
        }
    });
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
}); //title 渲染 add_users.ejs 

router.get('/add_recipe', (req, res) => {
    res.render('add_recipes', { title: 'Add Recipe' });
}); //title 渲染 add_recipes.ejs 

router.get('/add_order', (req, res) => {
    res.render('add_order', { title: 'Add Order' });
}); //title 渲染 add_order.ejs 


///map
router.get('/map', (req, res) => {
    res.render('gallery', { title: 'Website Map' });
}); //title 渲染 

///map_1
router.get('/map_1', (req, res) => {
    recipe.find({ "price": { $lt: 31 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_1", {
                head: "Category—price",
                con: "price",
                title: "Category—price",
                recipe: recipe,
            })
        }
    })
});

///map_2
router.get('/map_2', (req, res) => {
    recipe.find({ "star": { $gt: 30, $lt: 41 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_2", {
                head: "Category—price",
                con: "price",
                title: "Category—price",
                recipe: recipe,
            })
        }
    })
});

///map_3
router.get('/map_3', (req, res) => {
    recipe.find({ "star": { $gt: 40, $lt: 51 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_3", {
                head: "Category—price",
                con: "price",
                title: "Category—price",
                recipe: recipe,
            })
        }
    })
});

///map_4
router.get('/map_4', (req, res) => {
    recipe.find({ "star": { $gt: 50 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_4", {
                head: "Category—price",
                con: "price",
                title: "Category—price",
                recipe: recipe,
            })
        }
    })
});
///category_cake
router.get('/map_cake', (req, res) => {
    recipe.find({ "category": "cake" }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_cake", {
                head: "Category—cake",
                con: "cake",
                title: "Category—cake",
                recipe: recipe,
            })
        }
    })
});
///category_cookie
router.get('/map_cookie', (req, res) => {
    recipe.find({ "category": "cookie" }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_cookie", {
                head: "Category—cookie",
                con: "cookie",
                title: "Category—cookie",
                recipe: recipe,
            })
        }
    })
});
///category_bread
router.get('/map_bread', (req, res) => {
    recipe.find({ "category": "bread" }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_bread", {
                head: "Category—bread",
                con: "bread",
                title: "Category—bread",
                recipe: recipe,
            })
        }
    })
});
///category_fondant
router.get('/map_fondant', (req, res) => {
    recipe.find({ "category": "fondant" }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_fondant", {
                head: "Category—fondant",
                con: "fondant",
                title: "Category—fondant",
                recipe: recipe,
            })
        }
    })
});

///star_1
router.get('/map_star_1', (req, res) => {
    recipe.find({ "star": { $gt: 0, $lt: 11 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_star_1", {
                head: "Category—star-1",
                con: "star",
                title: "Category—star-1",
                recipe: recipe,
            })
        }
    })
});
///star_2
router.get('/map_star_2', (req, res) => {
    recipe.find({ "star": { $gt: 10, $lt: 21 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_star_2", {
                head: "Category—star-2",
                con: "star",
                title: "Category—star-2",
                recipe: recipe,
            })
        }
    })
});

///star_3
router.get('/map_star_3', (req, res) => {
    recipe.find({ "star": { $gt: 20, $lt: 31 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_star_3", {
                head: "Category—star-3",
                con: "star",
                title: "Category—star-3",
                recipe: recipe,
            })
        }
    })
});

///star_4
router.get('/map_star_4', (req, res) => {
    recipe.find({ "star": { $gt: 30 } }).exec((err, recipe) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("map_star_4", {
                head: "Category—star-4",
                con: "star",
                title: "Category—star-4",
                recipe: recipe,
            })
        }
    })
});

//flower
router.get('/Flower', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Flower Boutique'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Flower", {
                title: "Flower Boutique",
                comment: comment,
            })
        }
    })
});
//Lotus
router.get('/Lotus', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Lotus Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Lotus", {
                title: "Lotus Cake",
                comment: comment,
            })
        }
    })
});
//Homemade 
router.get('/Homemade', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Homemade Chocolate Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Homemade", {
                title: "Homemade Chocolate Cake",
                comment: comment,
            })
        }
    })
});
//Lego
router.get('/Lego', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Lego Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Lego", {
                title: "Lego Cake",
                comment: comment,
            })
        }
    })
});
//Unicorn
router.get('/Unicorn', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Unicorn Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Unicorn", {
                title: "Unicorn Cake",
                comment: comment,
            })
        }
    })
});
//Kinder
router.get('/Kinder', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Kinder Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Kinder", {
                title: "Kinder Cake",
                comment: comment,
            })
        }
    })
});
//Swirl 	
router.get('/Swirl', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Swirl Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Swirl", {
                title: "Swirl Cake",
                comment: comment,
            })
        }
    })
});
//Matcha
router.get('/Matcha', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Matcha Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Matcha", {
                title: "Matcha Cake",
                comment: comment,
            })
        }
    })
});
//Donuts
router.get('/Donuts', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Donuts Cake'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Donuts", {
                title: "Donuts Cake",
                comment: comment,
            })
        }
    })
});
//Valentine
router.get('/Valentine', (req, res) => {
    comment.aggregate([{
        $match: {
            'cake': 'Valentine Cake Pops'
        }
    }, {
        $lookup: {
            from: "recipes",
            localField: "cake",
            foreignField: "cake_name",
            as: "inventory_docs"
        }
    }]).exec((err, comment) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("Valentine", {
                title: "Valentine Cake Pops",
                comment: comment,
            })
        }
    })
});
module.exports = router;