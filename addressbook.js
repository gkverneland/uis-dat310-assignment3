var entries = [];
var addressBookTable = undefined;

function Entry(name, phone, email) {
    this.name = name;
    this.phone = phone;
    this.email = email;
}

$(function () {
    addressBookTable = $('#addressbook').DataTable({
        data: entries,
        columns: [
            {
                 data: 'name'
            },
            {
                 data: 'phone'
            },
            {
                data: null, render: function (entry)
                {
                    return "<a href=\"mailto:" + entry.email + "\">" + entry.email + "</a>";
                }
            },
            {
                data: null,
                render: function (entry) {
                    return "<a title=\"Edit " + entry.name + "\" href=\"#\" onclick=\"editEntry(" + entry.id + "); return false;\"><i class=\"fa fa-pencil\"></i></a>&nbsp;&nbsp;" +
                           "<a title=\"Delete " + entry.name + "\" href=\"#\" onclick=\"askToDelete(" + entry.id + "); return false;\"><i class=\"fa fa-trash-o\"></i></a>";
                    }
            }
        ]
    });

    addEntry(new Entry("Ola", "+47 900 90 900", "ola@mail.com"));
    addEntry(new Entry("Kari", "+47 900 90 901", "kari@mail.com"));
    addEntry(new Entry("Knut", "+47 900 90 902", "knut@mail.com"));
});

function addEntry(entry) {
    if (entries.length == 0) {
        entry.id = 1;
    } else {
        entry.id = entries[entries.length - 1].id + 1;
    }
    entries.push(entry);
    var newRow = addressBookTable.row.add(entry);
    newRow.draw();
};

function getEntryById(id) {
    return $.grep(entries, function(e){ return e.id == id; })[0];
}

function askToDelete(id) {
    var entry = getEntryById(id);
    if (entry === undefined || entry == null) {
        error("Error: Failed to locate entry with id " + id);
        return false;
    }
    if (confirm("Do you really want to delete " + entry.name + " from your address book?")) {
        performDelete(entry);
        return true;
    }
    return false;
}

function performDelete(entryToDelete) {
    var row = getRow(entryToDelete);
    row.remove();
    row.draw();

    for (var i = 0; i < entries.length; i++) {
        var currentEntry = entries[i];
        if (currentEntry.id == entryToDelete.id) {
            entries.splice(i, 1);
            return;
        }
    }
}

function toggleNewEntry() {
    resetMessages();
    $("#editFormHeader").html("New entry");
    resetEditForm();
    $("#editForm").slideToggle(200);
}

function editEntry(id) {
    resetMessages();
    var entry = getEntryById(id);
    $("#editEntryId").val("" + entry.id);
    $("#editFormHeader").html("Edit " + entry.name);
    $("#txtName").val(entry.name);
    $("#txtPhone").val(entry.phone);
    $("#txtEmail").val(entry.email);
    $("#editForm").slideDown(200);
}

function resetEditForm() {
    $("#editEntryId").val("");
    $("#txtName").val("");
    $("#txtPhone").val("");
    $("#txtEmail").val("");
}

function cancelEdit() {
    resetMessages();
    resetEditForm();
    $("#editForm").hide();
}

function getRow(entry) {
    for (var i = 0; i < entries.length; i++) {
        var row = addressBookTable.row(i);
        if (row.data().id == entry.id) {
            return row;
        }
    }
    error("Failed to find row with id " + entry.id);
    return null;
}

function save() {
    resetMessages();
    var id = $("#editEntryId").val();
    var name = $("#txtName").val();
    var phone = $("#txtPhone").val();
    var email = $("#txtEmail").val();
    if (!validateForm(name, email, phone)) {
        return false;
    }
    if (id == undefined || id == "") {
        addEntry(new Entry(name, phone, email));
        success(name + " was added");
    } else {
        var entry = getEntryById(id);
        entry.name = name;
        entry.phone = phone;
        entry.email = email;
        getRow(entry).data(entry);
        success(name + " was changed");
    }
    resetEditForm();
    $("#editForm").hide();
    return true;
}

function validateForm(name, email, phone) {
    if (name.length == 0) {
        error("Name must be specified");
        return false;
    }
    if (email.length == 0 && phone.length == 0) {
        error("Either e-mail or phone must be specified");
        return false;
    }
    if (email.length > 0 && !validateEmail(email)) {
        error("The e-mail address is invalid");
        return false;
    }
    if (phone.length > 0 && !validatePhone(phone)) {
        error("The phone number is invalid");
        return false;
    }
    return true;
}

function error(message) {
    $("#errorMessage").html(message);
    $("#errorContainer").show();
}

function success(message) {
    $("#successMessage").html(message);
    $("#successContainer").show();
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePhone(phone) {
    var re = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
    return re.test(phone);
}

function resetMessages() {
    $("#errorContainer").hide();
    $("#successContainer").hide();
}