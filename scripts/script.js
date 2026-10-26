document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('dataAgendamento');
    const selectHorario = document.getElementById('selectHorario');
    const form = document.getElementById('formAgendamento');

    if (inputData) {
        // 1. Bloquear datas passadas no calendário
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        inputData.setAttribute('min', `${ano}-${mes}-${dia}`);

        // 2. Evento ao escolher uma data
        inputData.addEventListener('change', function() {
            if (!this.value) {
                resetarSelectHorarios('-- Primeiro escolha a data acima --', true);
                return;
            }

            const dataEscolhida = new Date(this.value + 'T00:00:00');
            const dataHoje = new Date();
            dataHoje.setHours(0, 0, 0, 0);

            if (dataEscolhida < dataHoje) {
                alert('🚫 Não é possível agendar em datas passadas!');
                this.value = '';
                resetarSelectHorarios('-- Primeiro escolha a data acima --', true);
                return;
            }

            const diaDaSemana = dataEscolhida.getDay(); 
            // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado

            if (diaDaSemana === 2 || diaDaSemana === 3) {
                alert('🚫 A barbearia está fechada às terças e quartas-feiras! Por favor, escolha outro dia.');
                this.value = '';
                resetarSelectHorarios('-- Barbearia Fechada neste dia --', true);
                return;
            }

            preencherListaHorarios(diaDaSemana);
        });
    }

    function resetarSelectHorarios(mensagem, desabilitar) {
        if (!selectHorario) return;
        selectHorario.innerHTML = `<option value="">${mensagem}</option>`;
        selectHorario.disabled = desabilitar;
    }

    function preencherListaHorarios(diaDaSemana) {
        let horarios = [];

        // Seg (1), Qui (4), Sex (5): 13h às 18h
        if (diaDaSemana === 1 || diaDaSemana === 4 || diaDaSemana === 5) {
            horarios = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        } 
        // Sáb (6) ou Dom (0): 8h às 18h
        else if (diaDaSemana === 6 || diaDaSemana === 0) {
            horarios = ['06:00', '7:00', '8:00',  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        }

        selectHorario.innerHTML = '<option value="">-- Selecione um horário disponível --</option>';
        selectHorario.disabled = false;

        horarios.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            selectHorario.appendChild(option);
        });
    }

    // 3. Processamento do Envio do Formulário (WhatsApp)
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const servicoEl = document.querySelector('input[name="servico"]:checked');
            const localEl = document.querySelector('input[name="local"]:checked');
            const data = inputData.value;
            const horario = selectHorario.value;
            const nome = document.getElementById('nomeCliente').value;
            const telefone = document.getElementById('telCliente').value;
            const inputEndereco = document.getElementById('enderecoCliente');

            if (!servicoEl || !data || !horario || !localEl) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            let enderecoTexto = "";
            if (localEl.value === "Sua Residencia") {
                if (!inputEndereco.value.trim()) {
                    alert('Por favor, informe o endereço completo para o atendimento a domicílio.');
                    inputEndereco.focus();
                    return;
                }
                enderecoTexto = `\n📍 *Endereço:* ${inputEndereco.value}`;
            }

            const partesData = data.split('-');
            const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

            let mensagem = `💈 *NOVO AGENDAMENTO - BARBEARIA* 💈\n\n` +
                           `👤 *Nome:* ${nome}\n` +
                           `📱 *WhatsApp:* ${telefone}\n\n` +
                           `✂️ *Serviço:* ${servicoEl.value}\n` +
                           `📅 *Data:* ${dataFormatada}\n` +
                           `⏰ *Horário:* ${horario}\n` +
                           `📌 *Local:* ${localEl.value}`;

            if (enderecoTexto) {
                mensagem += enderecoTexto;
            }

            // Seu número oficial configurado
            const numeroBarbearia = "5516994224435"; 

            const urlWhatsApp = `https://wa.me/${numeroBarbearia}?text=${encodeURIComponent(mensagem)}`;
            window.open(urlWhatsApp, '_blank');
        });
    }
});

// Função para mostrar ou esconder o campo de endereço
function toggleEndereco(mostrar) {
    const campoEndereco = document.getElementById('campoEndereco');
    const inputEndereco = document.getElementById('enderecoCliente');

    if (mostrar) {
        campoEndereco.style.display = 'block';
        inputEndereco.required = true;
    } else {
        campoEndereco.style.display = 'none';
        inputEndereco.required = false;
        inputEndereco.value = '';
    }
}