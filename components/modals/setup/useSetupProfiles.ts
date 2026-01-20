import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Player, ClassProfile } from '../../../types';
import { COMPUTER_NAMES, PRELOADED_CLASSES } from '../../../constants';

interface UseSetupProfilesOptions {
  initialPlayers?: Player[];
}

type SetupPlayer = Partial<Player> & { id: string };

interface UseSetupProfilesResult {
  players: SetupPlayer[];
  setPlayers: Dispatch<SetStateAction<SetupPlayer[]>>;
  isSolo: boolean;
  setIsSolo: Dispatch<SetStateAction<boolean>>;
  classProfiles: ClassProfile[];
  selectedProfileId: string;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  newProfileName: string;
  setNewProfileName: Dispatch<SetStateAction<string>>;
  handleSoloToggle: (checked: boolean) => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  updatePlayer: (index: number, field: keyof Player, value: any) => void;
  loadClassProfile: (profileName: string) => void;
  saveClassProfile: () => void;
}

const MAX_PLAYERS = 5;

const readLocalStorageBoolean = (key: string, fallback = false) => {
  try {
    return window.localStorage.getItem(key) === 'true' || fallback;
  } catch {
    return fallback;
  }
};

const readLocalStorageString = (key: string, fallback = '') => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const generatePlayerId = () =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const hydratePlayer = (player: Partial<Player>, fallbackName: string, index: number): SetupPlayer => ({
  id: player.id ?? generatePlayerId(),
  name: player.name ?? fallbackName,
  isComputer: player.isComputer ?? false,
  difficulty: player.difficulty ?? 1,
  totalScore: player.totalScore,
  roundScore: player.roundScore,
});

const createHumanPlayer = (index: number): SetupPlayer => ({
  id: generatePlayerId(),
  name: `Player ${index}`,
  isComputer: false,
  difficulty: 1,
});

const createComputerPlayer = (): SetupPlayer => ({
  id: generatePlayerId(),
  name: COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)],
  isComputer: true,
  difficulty: 2,
});

export const useSetupProfiles = (
  options: UseSetupProfilesOptions
): UseSetupProfilesResult => {
  const { initialPlayers } = options;

  const initialPlayerState = useMemo<SetupPlayer[]>(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers.map((player, index) =>
        hydratePlayer(player, `Player ${index + 1}`, index + 1)
      );
    }

    const savedSolo = readLocalStorageBoolean('fs_last_issolo');
    const p1Name = readLocalStorageString('fs_player1_name', 'Player 1');

    if (savedSolo) {
      return [
        hydratePlayer({ name: p1Name, isComputer: false, difficulty: 1 }, 'Player 1', 1),
        createComputerPlayer(),
      ];
    }

    return [
      hydratePlayer({ name: p1Name, isComputer: false, difficulty: 1 }, 'Player 1', 1),
      createHumanPlayer(2),
    ];
  }, [initialPlayers]);

  const [players, setPlayers] = useState<SetupPlayer[]>(initialPlayerState);

  const [isSolo, setIsSolo] = useState<boolean>(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers.length === 2 && Boolean(initialPlayers[1].isComputer);
    }
    return readLocalStorageBoolean('fs_last_issolo');
  });

  const [classProfiles, setClassProfiles] = useState<ClassProfile[]>(() => {
    try {
      const saved = window.localStorage.getItem('fs_class_profiles');
      return saved ? [...PRELOADED_CLASSES, ...JSON.parse(saved)] : PRELOADED_CLASSES;
    } catch {
      return PRELOADED_CLASSES;
    }
  });

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  const handleSoloToggle = useCallback(
    (checked: boolean) => {
      setIsSolo(checked);

      setPlayers((prev) => {
        const next = [...prev];

        if (checked) {
          const human = next[0]
            ? { ...next[0], isComputer: false }
            : hydratePlayer({ name: 'Player 1', isComputer: false, difficulty: 1 }, 'Player 1', 1);

          const computer = next[1] && next[1].isComputer
            ? { ...next[1], name: COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)] }
            : createComputerPlayer();

          if (next.length > 2) {
            return [human, computer, ...next.slice(2)];
          }

          return [human, computer];
        }

        const human1 = next[0]
          ? { ...next[0], isComputer: false }
          : hydratePlayer({ name: 'Player 1', isComputer: false, difficulty: 1 }, 'Player 1', 1);

        let human2 = next[1];

        if (!human2) {
          human2 = createHumanPlayer(2);
        } else if (human2.isComputer) {
          human2 = { ...human2, name: 'Player 2', isComputer: false, difficulty: 1 };
        }

        if (next.length > 2) {
          return [human1, human2, ...next.slice(2)];
        }

        return [human1, human2];
      });
    },
    []
  );

  const addPlayer = useCallback(() => {
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev;
      return [
        ...prev,
        {
          id: generatePlayerId(),
          name: `Player ${prev.length + 1}`,
          isComputer: false,
          difficulty: 1,
        },
      ];
    });
  }, []);

  const removePlayer = useCallback((index: number) => {
    setPlayers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  }, []);

  const updatePlayer = useCallback((index: number, field: keyof Player, value: any) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) {
        return prev;
      }

      const nextPlayer = { ...current, [field]: value } as SetupPlayer;

      if (field === 'isComputer' && value === true) {
        nextPlayer.name = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
      } else if (field === 'isComputer' && value === false) {
        if (COMPUTER_NAMES.includes(nextPlayer.name || '')) {
          nextPlayer.name = `Player ${index + 1}`;
        }
      }

      updated[index] = nextPlayer;
      return updated;
    });
  }, []);

  const loadClassProfile = useCallback(
    (profileName: string) => {
      const profile = classProfiles.find((p) => p.name === profileName);
      if (!profile) return;

      const newPlayers = profile.players.map((name, index) =>
        hydratePlayer({ name, isComputer: false, difficulty: 1 }, `Player ${index + 1}`, index + 1)
      );

      setPlayers(newPlayers);
      setSelectedProfileId(profileName);
      setIsSolo(false);
    },
    [classProfiles]
  );

  const saveClassProfile = useCallback(() => {
    const trimmed = newProfileName.trim();
    if (!trimmed) {
      window.alert('Please enter a name for this class profile.');
      return;
    }

    const newProfile: ClassProfile = {
      name: trimmed,
      players: players.map((p) => p.name || 'Player'),
    };

    const customProfiles = classProfiles.filter(
      (profile) => !PRELOADED_CLASSES.some((preset) => preset.name === profile.name)
    );

    const existingIdx = customProfiles.findIndex((profile) => profile.name === newProfile.name);
    let updatedCustom: ClassProfile[];

    if (existingIdx >= 0) {
      const shouldOverwrite = window.confirm(
        `Overwrite existing profile "${newProfile.name}"?`
      );
      if (!shouldOverwrite) return;
      updatedCustom = [...customProfiles];
      updatedCustom[existingIdx] = newProfile;
    } else {
      updatedCustom = [...customProfiles, newProfile];
    }

    const allProfiles = [...PRELOADED_CLASSES, ...updatedCustom];
    setClassProfiles(allProfiles);
    setSelectedProfileId(newProfile.name);
    setNewProfileName('');

    try {
      window.localStorage.setItem('fs_class_profiles', JSON.stringify(updatedCustom));
    } catch {
      /* swallow storage errors */
    }
  }, [classProfiles, newProfileName, players]);

  return {
    players,
    setPlayers,
    isSolo,
    setIsSolo,
    classProfiles,
    selectedProfileId,
    setSelectedProfileId,
    newProfileName,
    setNewProfileName,
    handleSoloToggle,
    addPlayer,
    removePlayer,
    updatePlayer,
    loadClassProfile,
    saveClassProfile,
  };
};

