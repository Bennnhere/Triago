/* ==========================================================================
   ONCALL AI — script.js
   Shared vanilla JS. Each page's logic is guarded so this file can be
   safely included on every page via <script src="../script.js" defer>.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initLiveConsole();
  initSignupForm();
});

/* ==========================================================================
   Live correlation console (signup / marketing visual)
   ========================================================================== */
function initLiveConsole() {
  var consoleEl = document.getElementById('console');
  if (!consoleEl) return;

  var statusLabel = document.getElementById('statusLabel');
  var incidentNode = document.getElementById('incidentNode');
  var pipelineItems = document.querySelectorAll('#pipeline li');
  var chips = [
    document.getElementById('chip0'),
    document.getElementById('chip1'),
    document.getElementById('chip2'),
    document.getElementById('chip3'),
    document.getElementById('chip4')
  ];

  var stages = [
    { text: 'Correlating 5 alerts…', step: 0 },
    { text: 'Investigating logs & deploys…', step: 1 },
    { text: 'Searching incident memory…', step: 1 },
    { text: 'Root cause hypothesis found', step: 2 },
    { text: 'Executing safe action…', step: 3 },
    { text: 'Incident resolved', step: 4, done: true }
  ];

  var stageIndex = 0;
  var cycleTimer = null;

  function setPipeline(activeStep, done) {
    pipelineItems.forEach(function (li) {
      var step = parseInt(li.getAttribute('data-step'), 10);
      li.classList.remove('is-active', 'is-complete');
      if (done) {
        li.classList.add('is-complete');
      } else if (step < activeStep) {
        li.classList.add('is-complete');
      } else if (step === activeStep) {
        li.classList.add('is-active');
      }
    });
  }

  function pulseChips() {
    chips.forEach(function (chip, i) {
      if (!chip) return;
      setTimeout(function () {
        chip.classList.add('is-active');
        setTimeout(function () { chip.classList.remove('is-active'); }, 700);
      }, i * 120);
    });
  }

  function renderStage() {
    var stage = stages[stageIndex];
    if (statusLabel) {
      statusLabel.textContent = stage.text;
      statusLabel.classList.toggle('is-done', !!stage.done);
    }
    setPipeline(stage.step, !!stage.done);
    if (incidentNode) incidentNode.classList.toggle('is-resolved', !!stage.done);

    if (stage.step === 0) pulseChips();

    stageIndex = (stageIndex + 1) % stages.length;
  }

  renderStage();
  cycleTimer = setInterval(renderStage, 2200);

  // Pause the animation loop when the tab isn't visible to save cycles.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearInterval(cycleTimer);
    } else {
      cycleTimer = setInterval(renderStage, 2200);
    }
  });
}

/* ==========================================================================
   Signup form
   ========================================================================== */
function initSignupForm() {
  var form = document.getElementById('signupForm');
  if (!form) return;

  var fullName = document.getElementById('fullName');
  var workEmail = document.getElementById('workEmail');
  var password = document.getElementById('password');
  var confirmPassword = document.getElementById('confirmPassword');
  var terms = document.getElementById('terms');

  var togglePasswordBtn = document.getElementById('togglePassword');
  var eyeIcon = document.getElementById('eyeIcon');
  var strengthFill = document.getElementById('strengthFill');
  var strengthLabel = document.getElementById('strengthLabel');
  var reqList = document.getElementById('reqList');
  var submitBtn = document.getElementById('submitBtn');
  var formNote = document.getElementById('formNote');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- Show / hide password ---------- */
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      var isHidden = password.type === 'password';
      password.type = isHidden ? 'text' : 'password';
      togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      eyeIcon.style.opacity = isHidden ? '0.55' : '1';
    });
  }

  /* ---------- Password strength + live requirement checklist ---------- */
  function evaluatePassword(value) {
    var hasLen = value.length >= 8;
    var hasNum = /\d/.test(value);
    var hasCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
    var hasSymbol = /[^A-Za-z0-9]/.test(value);

    if (reqList) {
      toggleReq('len', hasLen);
      toggleReq('num', hasNum);
      toggleReq('case', hasCase);
    }

    var score = [hasLen, hasNum, hasCase, hasSymbol, value.length >= 12].filter(Boolean).length;
    return { hasLen: hasLen, hasNum: hasNum, hasCase: hasCase, score: score };
  }

  function toggleReq(key, met) {
    var li = reqList.querySelector('[data-req="' + key + '"]');
    if (li) li.classList.toggle('is-met', met);
  }

  function renderStrength(value) {
    if (!strengthFill || !strengthLabel) return;
    if (!value) {
      strengthFill.style.width = '0%';
      strengthFill.style.background = 'var(--critical)';
      strengthLabel.textContent = '\u00A0';
      return;
    }
    var result = evaluatePassword(value);
    var pct = Math.min(100, (result.score / 5) * 100);
    var label = 'Weak';
    var color = 'var(--critical)';
    if (result.score >= 4) { label = 'Strong'; color = 'var(--success)'; }
    else if (result.score >= 3) { label = 'Good'; color = 'var(--accent)'; }
    else if (result.score >= 2) { label = 'Fair'; color = 'var(--accent)'; }

    strengthFill.style.width = pct + '%';
    strengthFill.style.background = color;
    strengthLabel.textContent = label;
  }

  if (password) {
    password.addEventListener('input', function () {
      renderStrength(password.value);
      clearError('password');
    });
  }
  if (confirmPassword) {
    confirmPassword.addEventListener('input', function () { clearError('confirmPassword'); });
  }
  if (fullName) fullName.addEventListener('input', function () { clearError('fullName'); });
  if (workEmail) workEmail.addEventListener('input', function () { clearError('workEmail'); });

  /* ---------- Error helpers ---------- */
  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById('err-' + fieldId);
    if (field && field.closest('.field')) field.closest('.field').classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById('err-' + fieldId);
    if (field && field.closest('.field')) field.closest('.field').classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  }

  function clearAllErrors() {
    ['fullName', 'workEmail', 'password', 'confirmPassword'].forEach(clearError);
    var termsError = document.getElementById('err-terms');
    if (termsError) termsError.textContent = '';
  }

  /* ---------- Validation ---------- */
  function validate() {
    clearAllErrors();
    var isValid = true;

    if (!fullName.value.trim()) {
      setError('fullName', 'Enter your full name.');
      isValid = false;
    }

    if (!workEmail.value.trim()) {
      setError('workEmail', 'Enter your work email.');
      isValid = false;
    } else if (!EMAIL_RE.test(workEmail.value.trim())) {
      setError('workEmail', 'Enter a valid email address.');
      isValid = false;
    }

    var pw = password.value;
    var result = evaluatePassword(pw);
    if (!pw) {
      setError('password', 'Create a password.');
      isValid = false;
    } else if (!result.hasLen || !result.hasNum || !result.hasCase) {
      setError('password', 'Password doesn\u2019t meet the requirements above.');
      isValid = false;
    }

    if (!confirmPassword.value) {
      setError('confirmPassword', 'Confirm your password.');
      isValid = false;
    } else if (confirmPassword.value !== pw) {
      setError('confirmPassword', 'Passwords don\u2019t match.');
      isValid = false;
    }

    if (!terms.checked) {
      var termsError = document.getElementById('err-terms');
      if (termsError) termsError.textContent = 'You need to accept the terms to continue.';
      isValid = false;
    }

    return isValid;
  }

  /* ---------- Submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (formNote) {
      formNote.textContent = '';
      formNote.classList.remove('is-error');
    }

    if (!validate()) {
      if (formNote) {
        formNote.textContent = 'Check the highlighted fields and try again.';
        formNote.classList.add('is-error');
      }
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Simulate account creation. Swap this block for a real API call
    // to the backend when it's ready.
    setTimeout(function () {
      try {
        localStorage.setItem('oncall_user', JSON.stringify({
          name: fullName.value.trim(),
          email: workEmail.value.trim(),
          company: document.getElementById('company').value.trim()
        }));
      } catch (err) {
        /* localStorage unavailable — continue without it */
      }

      if (formNote) {
        formNote.textContent = 'Account created. Redirecting…';
        formNote.classList.remove('is-error');
      }

      window.location.href = 'onboarding.html';
    }, 900);
  });
}