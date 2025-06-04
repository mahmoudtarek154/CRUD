// DOM Elements
const elements = {
    patientName: document.getElementById("patientName"),
    productName: document.getElementById("productName"),
    selectedTests: document.getElementById("selectedTests"),
    productPrice: document.getElementById("productPrice"),
    productDiscription: document.getElementById("productDiscription"),
    productType: document.getElementById("productType"),
    productYear: document.getElementById("productYear"),
    searchInput: document.getElementById("searchInput"),
    searchMonth: document.getElementById("searchMonth"),
    searchYear: document.getElementById("searchYear"),
    updateBtn: document.getElementById("updateptn"),
    addBtn: document.getElementById("addptn"),
    loadingOverlay: document.getElementById("loadingOverlay"),
    labForm: document.getElementById("labForm")
};

// State Management
let productList = [];
let updatedindex = -1;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    showLoading();
    
    try {
        // Initialize Select2
        $('#selectedTests').select2({
            placeholder: "Select tests",
            allowClear: true,
            width: '100%'
        });

        // Populate year dropdowns
        populateYearDropdowns();

        // Load saved data
        loadSavedData();

        // Initialize form validation
        setupFormValidation();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application');
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    // Search input listeners
    elements.searchInput.addEventListener('input', debounce(searchproduct, 300));
    elements.searchMonth.addEventListener('change', searchByDate);
    elements.searchYear.addEventListener('change', searchByDate);

    // Form reset listener
    elements.labForm.addEventListener('reset', () => {
        setTimeout(() => {
            $('#selectedTests').val(null).trigger('change');
        }, 0);
    });

    // Price input validation
    elements.productPrice.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value < 0) e.target.value = 0;
    });
}

function populateYearDropdowns() {
    const currentYear = new Date().getFullYear();
    const yearDropdowns = [elements.productYear, elements.searchYear];
    
    yearDropdowns.forEach(dropdown => {
        for (let year = currentYear; year >= currentYear - 4; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            dropdown.appendChild(option);
        }
    });
    
    elements.productYear.value = currentYear;
}

function loadSavedData() {
    if (localStorage.getItem("list")) {
        try {
            productList = JSON.parse(localStorage.getItem("list"));
            displayProduct(productList);
            updateStatistics();
        } catch (error) {
            console.error('Error loading saved data:', error);
            showError('Failed to load saved data');
        }
    }
}

function setupFormValidation() {
    const form = elements.labForm;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.checkValidity()) {
            if (elements.updateBtn.classList.contains('d-none')) {
                AddProduct();
            } else {
                updateproduct();
            }
        }
        form.classList.add('was-validated');
    });
}

// Utility Functions
function showLoading() {
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showError(message) {
    // Implement your error notification system here
    alert(message);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getTestNames(selectedOptions) {
    return Array.from(selectedOptions).map(option => {
        const group = option.parentElement.label;
        return `${option.text} (${group})`;
    });
}

// Main Functions
async function AddProduct() {
    if (!validateForm()) return;

    showLoading();
    try {
        const selectedTestNames = getTestNames(elements.selectedTests.selectedOptions);
        
        const product = {
            patientName: elements.patientName.value.trim(),
            name: elements.productName.options[elements.productName.selectedIndex].text,
            doctorId: elements.productName.value,
            tests: selectedTestNames,
            testValues: Array.from(elements.selectedTests.selectedOptions).map(opt => opt.value),
            price: Number(elements.productPrice.value),
            month: elements.productType.options[elements.productType.selectedIndex].text,
            monthValue: elements.productType.value,
            year: Number(elements.productYear.value),
            discription: elements.productDiscription.value,
            createdAt: new Date().toISOString()
        };
        
        productList.push(product);
        await saveData();
        displayProduct(productList);
        updateStatistics();
        clearForm();
        
        // Show success message
        showSuccess('Test record added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        showError('Failed to add test record');
    } finally {
        hideLoading();
    }
}

function validateForm() {
    const requiredFields = {
        patientName: "Patient name",
        productName: "Doctor",
        selectedTests: "Tests",
        productPrice: "Price",
        productType: "Month",
        productYear: "Year"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!elements[field].value) {
            showError(`Please enter ${label}`);
            elements[field].focus();
            return false;
        }
    }

    if (elements.selectedTests.selectedOptions.length === 0) {
        showError("Please select at least one test");
        elements.selectedTests.focus();
        return false;
    }

    return true;
}

async function saveData() {
    try {
        localStorage.setItem("list", JSON.stringify(productList));
    } catch (error) {
        console.error('Error saving data:', error);
        throw new Error('Failed to save data');
    }
}

function displayProduct(List, term, searchField = 'name') {
    const container = document.getElementById('myRow');
    
    if (!List.length) {
        container.innerHTML = '<div class="col-12 text-center mt-4">No records found</div>';
        return;
    }

    const cards = List.map((item, index) => {
        const highlightedDoctor = term && searchField === 'name'
            ? item.name.replaceAll(term, `<span class="bg-dark text-white-50">${term}</span>`)
            : item.name;
            
        const highlightedPatient = term && searchField === 'name'
            ? item.patientName.replaceAll(term, `<span class="bg-dark text-white-50">${term}</span>`)
            : item.patientName;

        const testsHtml = item.tests.map(test => {
            const highlightedTest = term && searchField === 'test' && test.toLowerCase().includes(term.toLowerCase())
                ? test.replaceAll(new RegExp(term, 'gi'), `<span class="bg-dark text-white-50">$&</span>`)
                : test;
            return `<li class="test-item"><i class="fas fa-vial"></i>${highlightedTest}</li>`;
        }).join('');

        return `
            <div class="col-md-4 animate__animated animate__fadeIn">
                <div class="productdiv">
                    <div class="card-header-section">
                        <h3><i class="fas fa-user"></i>${highlightedPatient}</h3>
                        <h4><i class="fas fa-user-md"></i>${highlightedDoctor}</h4>
                        <div class="price-display">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>EGP ${item.price.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="tests-list">
                        <p><i class="fas fa-flask"></i>Selected Tests</p>
                        <ul class="list-unstyled">
                            ${testsHtml}
                        </ul>
                    </div>

                    <div class="card-info">
                        <p><i class="fas fa-calendar"></i>Date: ${item.month} ${item.year}</p>
                        <p><i class="fas fa-clipboard-list"></i>Notes: ${item.discription || 'No additional notes'}</p>
                    </div>

                    <div class="card-actions">
                        <button onclick="setFormForUpdate(${index})" type="button" class="btn btn4">
                            <i class="fas fa-edit"></i>Update
                        </button>
                        <button onclick="deleteProduct(${index})" type="button" class="btn btn5">
                            <i class="fas fa-trash-alt"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cards;
}

function clearForm() {
    elements.labForm.reset();
    $('#selectedTests').val(null).trigger('change');
    elements.productYear.value = new Date().getFullYear();
    elements.labForm.classList.remove('was-validated');
}

async function deleteProduct(index) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    showLoading();
    try {
        productList.splice(index, 1);
        await saveData();
        displayProduct(productList);
        updateStatistics();
        showSuccess('Record deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete record');
    } finally {
        hideLoading();
    }
}

const searchproduct = debounce(() => {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const searchList = productList.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.patientName.toLowerCase().includes(searchTerm)
    );
    
    displayProduct(searchList, elements.searchInput.value, 'name');
    updateStatistics(searchList);
}, 300);

function searchByDate() {
    const selectedMonth = elements.searchMonth.value;
    const selectedYear = elements.searchYear.value;
    
    let searchList = productList;
    
    if (selectedMonth || selectedYear) {
        searchList = productList.filter(product => {
            const monthMatch = !selectedMonth || product.month === selectedMonth;
            const yearMatch = !selectedYear || product.year === Number(selectedYear);
            return monthMatch && yearMatch;
        });
    }
    
    displayProduct(searchList);
    updateStatistics(searchList);
}

function setFormForUpdate(index) {
    updatedindex = index;
    const item = productList[index];

    elements.updateBtn.classList.remove("d-none");
    elements.addBtn.classList.add("d-none");

    elements.patientName.value = item.patientName;
    elements.productName.value = item.doctorId;
    $('#selectedTests').val(item.testValues).trigger('change');
    elements.productPrice.value = item.price;
    elements.productType.value = item.monthValue;
    elements.productYear.value = item.year;
    elements.productDiscription.value = item.discription;

    elements.patientName.focus();
}

async function updateproduct() {
    if (!validateForm()) return;

    showLoading();
    try {
        const selectedTestNames = getTestNames(elements.selectedTests.selectedOptions);

        productList[updatedindex] = {
            ...productList[updatedindex],
            patientName: elements.patientName.value.trim(),
            name: elements.productName.options[elements.productName.selectedIndex].text,
            doctorId: elements.productName.value,
            tests: selectedTestNames,
            testValues: Array.from(elements.selectedTests.selectedOptions).map(opt => opt.value),
            price: Number(elements.productPrice.value),
            month: elements.productType.options[elements.productType.selectedIndex].text,
            monthValue: elements.productType.value,
            year: Number(elements.productYear.value),
            discription: elements.productDiscription.value,
            updatedAt: new Date().toISOString()
        };

        await saveData();
        displayProduct(productList);
        updateStatistics();
        clearForm();
        
        elements.updateBtn.classList.add("d-none");
        elements.addBtn.classList.remove("d-none");
        
        showSuccess('Record updated successfully');
    } catch (error) {
        console.error('Error updating product:', error);
        showError('Failed to update record');
    } finally {
        hideLoading();
    }
}

function updateStatistics(filteredList = productList) {
    try {
        // Calculate total revenue
        const totalRevenue = filteredList.reduce((sum, product) => sum + Number(product.price), 0);
        document.getElementById('totalRevenue').textContent = `EGP ${totalRevenue.toLocaleString()}`;
        document.getElementById('floatingTotal').textContent = `EGP ${totalRevenue.toLocaleString()}`;

        // Calculate active doctors
        const activeDoctors = new Set(filteredList.map(product => product.name)).size;
        document.getElementById('activeDoctors').textContent = `${activeDoctors} doctors`;

        // Update statistics section title
        updateStatisticsTitle(filteredList);

        // Calculate and display monthly breakdown
        updateMonthlyBreakdown(filteredList);
    } catch (error) {
        console.error('Error updating statistics:', error);
        showError('Failed to update statistics');
    }
}

function updateStatisticsTitle(filteredList) {
    const statsTitle = document.querySelector('.statistics-section h2');
    if (filteredList.length < productList.length) {
        statsTitle.innerHTML = `
            <i class="fas fa-chart-line me-2"></i>Financial Summary 
            <span class="filtered-text">(Filtered Results)</span>
        `;
    } else {
        statsTitle.innerHTML = `<i class="fas fa-chart-line me-2"></i>Financial Summary`;
    }
}

function updateMonthlyBreakdown(filteredList) {
    // Initialize monthly data with year tracking
    const monthlyData = {};
    
    filteredList.forEach(product => {
        const year = product.year || new Date().getFullYear();
        const monthYear = `${product.month}_${year}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                month: product.month,
                year: year,
                revenue: 0,
                tests: 0
            };
        }
        
        monthlyData[monthYear].revenue += Number(product.price);
        monthlyData[monthYear].tests += product.tests.length;
    });

    // Sort by year and month
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const sortedMonths = Object.values(monthlyData).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Generate table HTML
    let tableHTML = '';
    let currentYear = null;

    sortedMonths.forEach(data => {
        if (currentYear !== data.year) {
            currentYear = data.year;
            tableHTML += `
                <tr class="year-separator">
                    <td colspan="4" class="text-center fw-bold py-3">
                        <span class="year-title">${data.year}</span>
                    </td>
                </tr>
            `;
        }

        const avgPerTest = data.tests > 0 ? data.revenue / data.tests : 0;
        
        tableHTML += `
            <tr>
                <td class="month-cell">
                    ${data.month}
                </td>
                <td>EGP ${data.revenue.toLocaleString()}</td>
                <td>${data.tests}</td>
                <td>EGP ${avgPerTest.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
            </tr>
        `;
    });

    // Add summary row if there's data
    if (filteredList.length > 0) {
        const totalTests = filteredList.reduce((sum, product) => sum + product.tests.length, 0);
        const avgPerTest = totalTests > 0 ? 
            filteredList.reduce((sum, product) => sum + Number(product.price), 0) / totalTests : 0;
            
        tableHTML += `
            <tr class="table-summary">
                <td><strong style="color: #1a237e;">Total</strong></td>
                <td><strong style="color: #1a237e;">EGP ${filteredList.reduce((sum, product) => 
                    sum + Number(product.price), 0).toLocaleString()}</strong></td>
                <td><strong style="color: #1a237e;">${totalTests}</strong></td>
                <td><strong style="color: #1a237e;">EGP ${avgPerTest.toLocaleString(undefined, 
                    {maximumFractionDigits: 2})}</strong></td>
            </tr>
        `;
    }

    document.getElementById('monthlyBreakdownBody').innerHTML = 
        tableHTML || '<tr><td colspan="4" class="text-center">No data available</td></tr>';
}

// Success notification function
function showSuccess(message) {
    // Implement your success notification system here
    // For now, we'll just use alert
    alert(message);
}