import torch
import torch.nn as nn
import torch.nn.functional as F
from app.core.config import LSTM_WEIGHTS_PATH, settings

class TemporalAttention(nn.Module):
    def __init__(self, hidden_size):
        super(TemporalAttention, self).__init__()
        # Se remueve bias=False para que coincida con el original
        self.attention = nn.Linear(hidden_size, 1)

    def forward(self, lstm_output):
        attn_weights = self.attention(lstm_output).squeeze(2)
        attn_weights = F.softmax(attn_weights, dim=1)
        context = torch.bmm(attn_weights.unsqueeze(1), lstm_output).squeeze(1)
        return context, attn_weights

class LSTMClassifier(nn.Module):
    def __init__(self, input_size=512, hidden_size=192, num_layers=2, bidirectional=True, dropout_fc=0.264, use_attention=True):
        super(LSTMClassifier, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.use_attention = use_attention
        
        self.lstm = nn.LSTM(
            input_size, 
            hidden_size, 
            num_layers, 
            batch_first=True, 
            bidirectional=bidirectional
        )
        
        lstm_out_size = hidden_size * 2 if bidirectional else hidden_size
        
        if use_attention:
            self.attention = TemporalAttention(lstm_out_size)
            
        self.fc_layers = nn.Sequential(
            nn.Linear(lstm_out_size, 128),
            nn.ReLU(),
            nn.Dropout(dropout_fc),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers * (2 if self.bidirectional else 1), x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers * (2 if self.bidirectional else 1), x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        
        attn_weights = None
        if self.use_attention:
            context, attn_weights = self.attention(out)
            x_fc = context
        else:
            x_fc = out[:, -1, :]
            
        logits = self.fc_layers(x_fc)
        
        return logits, attn_weights

def get_lstm_model():
    model = LSTMClassifier(
        input_size=settings.LSTM_INPUT_SIZE,
        hidden_size=settings.LSTM_HIDDEN_SIZE,
        num_layers=settings.LSTM_NUM_LAYERS,
        bidirectional=settings.LSTM_BIDIRECTIONAL,
        use_attention=settings.LSTM_USE_ATTENTION,
        dropout_fc=0.0  # El dropout no afecta en inferencia. Se deja 0.0 explícito.
    )
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    if LSTM_WEIGHTS_PATH.exists():
        state_dict = torch.load(LSTM_WEIGHTS_PATH, map_location=device)
        model.load_state_dict(state_dict)
    
    model = model.to(device)
    model.eval()
    
    return model
