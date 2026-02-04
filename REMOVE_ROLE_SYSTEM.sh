#!/bin/bash

echo "🗑️  Suppression du système de gestion des rôles..."
echo "===================================================="
echo ""

# Fichiers de documentation à supprimer
echo "📄 Suppression des fichiers de documentation..."
rm -f ROLE_MANAGEMENT_GUIDE.md
rm -f ROLE_SYSTEM_SUMMARY.md
rm -f SYSTEM_OVERVIEW.md
rm -f COMPLETE_TEST_GUIDE.md
rm -f MODIFICATION_SUMMARY.md
rm -f FILE_INDEX.md
rm -f ERROR_GUIDE.md
rm -f FIXES_AND_TESTS.md
rm -f POSTGRESQL_MIGRATION_INFO.md
rm -f FILES_MANIFEST.md
rm -f FINAL_SUMMARY.md
rm -f README_ROLE_SYSTEM.md
rm -f ROLE_SYSTEM_COMPLETE.txt
echo "✅ Documentation supprimée"

# Scripts et fichiers de test à supprimer
echo ""
echo "🧪 Suppression des scripts de test..."
rm -f QUICK_START_INTERACTIVE.sh
rm -f START_ALL.sh
rm -f test-api.html
rm -f test-role-system.sh
rm -f role_history_migration_postgres.sql
echo "✅ Scripts de test supprimés"

# Fichiers backend à supprimer
echo ""
echo "🔧 Suppression des fichiers backend..."
rm -f demo/src/main/java/com/example/demo/model/Role.java
rm -f demo/src/main/java/com/example/demo/model/RoleChangeHistory.java
rm -f demo/src/main/java/com/example/demo/repository/RoleChangeHistoryRepository.java
rm -f demo/src/main/java/com/example/demo/controller/DebugController.java
echo "✅ Fichiers backend supprimés"

# Fichiers frontend à supprimer
echo ""
echo "🎨 Suppression des fichiers frontend..."
rm -f frontend/src/components/UserRoleManager.tsx
rm -f frontend/src/components/RoleHierarchy.tsx
rm -f frontend/src/components/DebugPanel.tsx
echo "✅ Fichiers frontend supprimés"

echo ""
echo "✅ Suppression complète du système de gestion des rôles"
echo ""
echo "⚠️  NOTE: Les modifications dans ces fichiers ont été conservées:"
echo "   - demo/src/main/java/com/example/demo/service/UserManagementService.java"
echo "   - demo/src/main/java/com/example/demo/controller/UserManagementController.java"
echo "   - demo/src/main/java/com/example/demo/security/CustomUserDetailsService.java"
echo "   - frontend/src/components/UserProfile.tsx"
echo "   - frontend/src/components/UserRoleManager.tsx"
echo "   - frontend/src/services/api.ts"
echo ""
echo "📝 Pour restaurer complètement, vous devrez :"
echo "   - Supprimer les méthodes ajoutées dans les services/contrôleurs"
echo "   - Revertir les modifications dans les fichiers modifiés"
echo ""
